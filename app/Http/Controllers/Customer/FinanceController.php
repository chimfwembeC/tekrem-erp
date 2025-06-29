<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use App\Models\Finance\Quotation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display customer's financial overview.
     */
    public function index(): Response
    {
        $user = Auth::user();
        
        // Get financial statistics
        $stats = [
            'total_invoices' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->count(),
            'paid_invoices' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->where('status', 'paid')->count(),
            'pending_invoices' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->where('status', 'pending')->count(),
            'overdue_invoices' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->where('status', 'overdue')->count(),
            'total_amount' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->sum('total_amount'),
            'paid_amount' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)->where('status', 'paid')->sum('total_amount'),
            'outstanding_amount' => Invoice::where('billable_type', User::class)->where('billable_id', $user->id)
                ->whereIn('status', ['pending', 'overdue'])
                ->sum('total_amount'),
        ];

        // Get recent invoices
        $recentInvoices = Invoice::where('billable_type', User::class)->where('billable_id', $user->id)
            ->with(['items', 'payments'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent payments
        $recentPayments = Payment::whereHas('invoice', function ($query) use ($user) {
                $query->where('billable_type', User::class)->where('billable_id', $user->id);
            })
            ->with(['invoice', 'paymentMethod'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get recent quotations
        $recentQuotations = Quotation::where('billable_type', User::class)->where('billable_id', $user->id)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Customer/Finance/Dashboard', [
            'stats' => $stats,
            'recentInvoices' => $recentInvoices,
            'recentPayments' => $recentPayments,
            'recentQuotations' => $recentQuotations,
        ]);
    }

    /**
     * Display customer's invoices.
     */
    public function invoices(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Invoice::where('billable_type', User::class)->where('billable_id', $user->id)
            ->with(['items', 'payments']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('invoice_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('invoice_date', '<=', $request->date_to);
        }

        $invoices = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Customer/Finance/Invoices', [
            'invoices' => $invoices,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified invoice.
     */
    public function showInvoice(Invoice $invoice): Response
    {
        $user = Auth::user();
        
        // Ensure user can access this invoice
        if ($invoice->billable_type !== User::class || $invoice->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $invoice->load(['client', 'items', 'payments.paymentMethod', 'project']);

        return Inertia::render('Customer/Finance/ShowInvoice', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Download invoice PDF.
     */
    public function downloadInvoice(Invoice $invoice)
    {
        $user = Auth::user();
        
        // Ensure user can access this invoice
        if ($invoice->billable_type !== User::class || $invoice->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        // Generate and return PDF
        $pdf = app(\App\Services\Finance\InvoicePDFService::class)->generate($invoice);
        
        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="invoice-' . $invoice->invoice_number . '.pdf"');
    }

    /**
     * Display customer's payments.
     */
    public function payments(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Payment::whereHas('invoice', function ($q) use ($user) {
                $q->where('billable_type', User::class)->where('billable_id', $user->id);
            })
            ->with(['invoice', 'paymentMethod']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('invoice', function ($subQ) use ($request) {
                      $subQ->where('invoice_number', 'like', '%' . $request->search . '%');
                  });
            });
        }

        if ($request->filled('date_from')) {
            $query->where('payment_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('payment_date', '<=', $request->date_to);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Customer/Finance/Payments', [
            'payments' => $payments,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified payment.
     */
    public function showPayment(Payment $payment): Response
    {
        $user = Auth::user();
        
        // Ensure user can access this payment
        if ($payment->invoice->billable_type !== User::class || $payment->invoice->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $payment->load(['invoice.client', 'paymentMethod']);

        return Inertia::render('Customer/Finance/ShowPayment', [
            'payment' => $payment,
        ]);
    }

    /**
     * Display customer's quotations.
     */
    public function quotations(Request $request): Response
    {
        $user = Auth::user();
        
        $query = Quotation::where('billable_type', User::class)->where('billable_id', $user->id)
            ->with(['items']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('quotation_number', 'like', '%' . $request->search . '%')
                  ->orWhere('title', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('date_from')) {
            $query->where('quotation_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('quotation_date', '<=', $request->date_to);
        }

        $quotations = $query->orderBy('created_at', 'desc')->paginate(20);

        return Inertia::render('Customer/Finance/Quotations', [
            'quotations' => $quotations,
            'filters' => $request->only(['status', 'search', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Display the specified quotation.
     */
    public function showQuotation(Quotation $quotation): Response
    {
        $user = Auth::user();
        
        // Ensure user can access this quotation
        if ($quotation->billable_type !== User::class || $quotation->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        $quotation->load(['client', 'items', 'lead']);

        return Inertia::render('Customer/Finance/ShowQuotation', [
            'quotation' => $quotation,
        ]);
    }

    /**
     * Accept a quotation.
     */
    public function acceptQuotation(Quotation $quotation)
    {
        $user = Auth::user();
        
        // Ensure user can access this quotation
        if ($quotation->billable_type !== User::class || $quotation->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        if ($quotation->status !== 'sent') {
            return redirect()->back()->withErrors(['error' => 'This quotation cannot be accepted.']);
        }

        $quotation->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Quotation accepted successfully!'
        ]);

        return redirect()->route('customer.finance.quotations.show', $quotation);
    }

    /**
     * Download quotation PDF.
     */
    public function downloadQuotation(Quotation $quotation)
    {
        $user = Auth::user();
        
        // Ensure user can access this quotation
        if ($quotation->billable_type !== User::class || $quotation->billable_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        // Generate and return PDF
        $pdf = app(\App\Services\Finance\QuotationPDFService::class)->generate($quotation);
        
        return response($pdf)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="quotation-' . $quotation->quotation_number . '.pdf"');
    }
}
