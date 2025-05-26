<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Payment;
use App\Models\Finance\Invoice;
use App\Models\Finance\Account;
use App\Models\Finance\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::where('user_id', auth()->id())
            ->with(['invoice.billable', 'account']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('invoice', function($invoiceQuery) use ($search) {
                      $invoiceQuery->where('invoice_number', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by payment method
        if ($request->filled('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('payment_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('payment_date', '<=', $request->date_to);
        }

        $payments = $query->latest('payment_date')->paginate(15)->withQueryString();

        $paymentMethods = [
            'cash' => 'Cash',
            'check' => 'Check',
            'bank_transfer' => 'Bank Transfer',
            'credit_card' => 'Credit Card',
            'paypal' => 'PayPal',
            'stripe' => 'Stripe',
            'other' => 'Other'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed',
            'failed' => 'Failed',
            'refunded' => 'Refunded'
        ];

        return Inertia::render('Finance/Payments/Index', [
            'payments' => $payments,
            'paymentMethods' => $paymentMethods,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'payment_method', 'status', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        // Get unpaid or partially paid invoices
        $invoices = Invoice::where('user_id', auth()->id())
            ->whereIn('status', ['sent', 'overdue'])
            ->where('paid_amount', '<', DB::raw('total_amount'))
            ->with('billable')
            ->orderBy('due_date')
            ->get();

        // Get active accounts
        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $paymentMethods = [
            'cash' => 'Cash',
            'check' => 'Check',
            'bank_transfer' => 'Bank Transfer',
            'credit_card' => 'Credit Card',
            'paypal' => 'PayPal',
            'stripe' => 'Stripe',
            'other' => 'Other'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed'
        ];

        // Pre-select invoice if provided
        $selectedInvoice = null;
        if ($request->filled('invoice')) {
            $selectedInvoice = Invoice::where('user_id', auth()->id())
                ->where('id', $request->invoice)
                ->with('billable')
                ->first();
        }

        return Inertia::render('Finance/Payments/Create', [
            'invoices' => $invoices,
            'accounts' => $accounts,
            'paymentMethods' => $paymentMethods,
            'statuses' => $statuses,
            'selectedInvoice' => $selectedInvoice,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'invoice_id' => 'required|exists:invoices,id',
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:cash,check,bank_transfer,credit_card,paypal,stripe,other',
            'reference_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,completed,failed',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify invoice and account ownership
        $invoice = Invoice::where('id', $request->invoice_id)
            ->where('user_id', auth()->id())
            ->first();

        $account = Account::where('id', $request->account_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$invoice || !$account) {
            return back()->with('error', 'Invoice or account not found or access denied.');
        }

        // Check if payment amount doesn't exceed remaining balance
        $remainingBalance = $invoice->total_amount - $invoice->paid_amount;
        if ($request->amount > $remainingBalance) {
            return back()->with('error', 'Payment amount cannot exceed remaining invoice balance.');
        }

        DB::transaction(function () use ($request, $invoice, $account) {
            // Create payment
            $payment = Payment::create([
                'payment_number' => Payment::generatePaymentNumber(),
                'invoice_id' => $request->invoice_id,
                'account_id' => $request->account_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'status' => $request->status,
                'notes' => $request->notes,
                'user_id' => auth()->id(),
            ]);

            // Update invoice paid amount if payment is completed
            if ($request->status === 'completed') {
                $invoice->increment('paid_amount', $request->amount);

                // Update invoice status based on payment
                if ($invoice->fresh()->paid_amount >= $invoice->total_amount) {
                    $invoice->update(['status' => 'paid']);
                } elseif ($invoice->paid_amount > 0) {
                    $invoice->update(['status' => 'partial']);
                }

                // Create corresponding transaction
                Transaction::create([
                    'type' => 'income',
                    'amount' => $request->amount,
                    'description' => 'Payment received for invoice ' . $invoice->invoice_number,
                    'transaction_date' => $request->payment_date,
                    'reference_number' => $request->reference_number,
                    'status' => 'completed',
                    'account_id' => $request->account_id,
                    'invoice_id' => $request->invoice_id,
                    'user_id' => auth()->id(),
                ]);

                // Update account balance
                $account->updateBalance();
            }
        });

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment recorded successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Payment $payment)
    {
        // Ensure user can only view their own payments
        if ($payment->user_id !== auth()->id()) {
            abort(403);
        }

        $payment->load(['invoice.billable', 'account', 'transaction']);

        return Inertia::render('Finance/Payments/Show', [
            'payment' => $payment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Payment $payment)
    {
        // Ensure user can only edit their own payments
        if ($payment->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing of pending payments
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Only pending payments can be edited.');
        }

        $payment->load(['invoice.billable', 'account']);

        // Get unpaid or partially paid invoices
        $invoices = Invoice::where('user_id', auth()->id())
            ->whereIn('status', ['sent', 'overdue', 'partial'])
            ->where(function($query) use ($payment) {
                $query->where('paid_amount', '<', DB::raw('total_amount'))
                      ->orWhere('id', $payment->invoice_id);
            })
            ->with('billable')
            ->orderBy('due_date')
            ->get();

        // Get active accounts
        $accounts = Account::where('user_id', auth()->id())
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'currency']);

        $paymentMethods = [
            'cash' => 'Cash',
            'check' => 'Check',
            'bank_transfer' => 'Bank Transfer',
            'credit_card' => 'Credit Card',
            'paypal' => 'PayPal',
            'stripe' => 'Stripe',
            'other' => 'Other'
        ];

        $statuses = [
            'pending' => 'Pending',
            'completed' => 'Completed',
            'failed' => 'Failed'
        ];

        return Inertia::render('Finance/Payments/Edit', [
            'payment' => $payment,
            'invoices' => $invoices,
            'accounts' => $accounts,
            'paymentMethods' => $paymentMethods,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Payment $payment)
    {
        // Ensure user can only update their own payments
        if ($payment->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing of pending payments
        if ($payment->status !== 'pending') {
            return back()->with('error', 'Only pending payments can be edited.');
        }

        $validator = Validator::make($request->all(), [
            'invoice_id' => 'required|exists:invoices,id',
            'account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|in:cash,check,bank_transfer,credit_card,paypal,stripe,other',
            'reference_number' => 'nullable|string|max:255',
            'status' => 'required|string|in:pending,completed,failed',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify invoice and account ownership
        $invoice = Invoice::where('id', $request->invoice_id)
            ->where('user_id', auth()->id())
            ->first();

        $account = Account::where('id', $request->account_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$invoice || !$account) {
            return back()->with('error', 'Invoice or account not found or access denied.');
        }

        // Check if payment amount doesn't exceed remaining balance (excluding current payment)
        $remainingBalance = $invoice->total_amount - ($invoice->paid_amount - $payment->amount);
        if ($request->amount > $remainingBalance) {
            return back()->with('error', 'Payment amount cannot exceed remaining invoice balance.');
        }

        DB::transaction(function () use ($request, $payment, $invoice, $account) {
            $oldAmount = $payment->amount;
            $oldStatus = $payment->status;
            $oldInvoice = $payment->invoice;

            // Update payment
            $payment->update([
                'invoice_id' => $request->invoice_id,
                'account_id' => $request->account_id,
                'amount' => $request->amount,
                'payment_date' => $request->payment_date,
                'payment_method' => $request->payment_method,
                'reference_number' => $request->reference_number,
                'status' => $request->status,
                'notes' => $request->notes,
            ]);

            // Handle status changes and invoice updates
            if ($oldStatus === 'completed' && $request->status !== 'completed') {
                // Payment was completed, now it's not - reverse the payment
                $oldInvoice->decrement('paid_amount', $oldAmount);

                // Update old invoice status
                if ($oldInvoice->fresh()->paid_amount <= 0) {
                    $oldInvoice->update(['status' => 'sent']);
                } elseif ($oldInvoice->paid_amount < $oldInvoice->total_amount) {
                    $oldInvoice->update(['status' => 'partial']);
                }

                // Delete the transaction if it exists
                if ($payment->transaction) {
                    $payment->transaction->delete();
                }
            }

            if ($request->status === 'completed') {
                // Payment is now completed
                if ($oldStatus !== 'completed') {
                    // This is a new completion
                    $invoice->increment('paid_amount', $request->amount);
                } else {
                    // Update existing completion with new amount
                    $invoice->increment('paid_amount', $request->amount - $oldAmount);
                }

                // Update invoice status
                if ($invoice->fresh()->paid_amount >= $invoice->total_amount) {
                    $invoice->update(['status' => 'paid']);
                } elseif ($invoice->paid_amount > 0) {
                    $invoice->update(['status' => 'partial']);
                }

                // Create or update transaction
                if ($payment->transaction) {
                    $payment->transaction->update([
                        'amount' => $request->amount,
                        'description' => 'Payment received for invoice ' . $invoice->invoice_number,
                        'transaction_date' => $request->payment_date,
                        'reference_number' => $request->reference_number,
                        'account_id' => $request->account_id,
                        'invoice_id' => $request->invoice_id,
                    ]);
                } else {
                    Transaction::create([
                        'type' => 'income',
                        'amount' => $request->amount,
                        'description' => 'Payment received for invoice ' . $invoice->invoice_number,
                        'transaction_date' => $request->payment_date,
                        'reference_number' => $request->reference_number,
                        'status' => 'completed',
                        'account_id' => $request->account_id,
                        'invoice_id' => $request->invoice_id,
                        'user_id' => auth()->id(),
                    ]);
                }

                // Update account balance
                $account->updateBalance();
            }
        });

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        // Ensure user can only delete their own payments
        if ($payment->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow deletion of pending or failed payments
        if (!in_array($payment->status, ['pending', 'failed'])) {
            return back()->with('error', 'Only pending or failed payments can be deleted.');
        }

        $payment->delete();

        return redirect()->route('finance.payments.index')
            ->with('success', 'Payment deleted successfully.');
    }
}
