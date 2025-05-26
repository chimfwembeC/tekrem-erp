<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Invoice;
use App\Models\Client;
use App\Models\Lead;
use App\Services\FinanceAIService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Invoice::where('user_id', auth()->id())
            ->with(['billable', 'payments']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('billable', function($billableQuery) use ($search) {
                      $billableQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('issue_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('issue_date', '<=', $request->date_to);
        }

        // Filter by due date range
        if ($request->filled('due_from')) {
            $query->whereDate('due_date', '>=', $request->due_from);
        }
        if ($request->filled('due_to')) {
            $query->whereDate('due_date', '<=', $request->due_to);
        }

        $invoices = $query->latest('issue_date')->paginate(15)->withQueryString();

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent',
            'paid' => 'Paid',
            'overdue' => 'Overdue',
            'cancelled' => 'Cancelled'
        ];

        return Inertia::render('Finance/Invoices/Index', [
            'invoices' => $invoices,
            'statuses' => $statuses,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to', 'due_from', 'due_to']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Get clients and leads for billable selection
        $clients = Client::where('user_id', auth()->id())
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $leads = Lead::where('user_id', auth()->id())
            ->where('status', 'qualified')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
        ];

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent'
        ];

        return Inertia::render('Finance/Invoices/Create', [
            'clients' => $clients,
            'leads' => $leads,
            'currencies' => $currencies,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'billable_type' => 'required|string|in:client,lead',
            'billable_id' => 'required|integer',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'currency' => 'required|string|max:3',
            'status' => 'required|string|in:draft,sent',
            'notes' => 'nullable|string|max:1000',
            'terms' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify billable entity ownership
        $billableClass = $request->billable_type === 'client' ? Client::class : Lead::class;
        $billable = $billableClass::where('id', $request->billable_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$billable) {
            return back()->with('error', 'Billable entity not found or access denied.');
        }

        DB::transaction(function () use ($request, $billable) {
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $discountAmount = $request->discount_amount ?? 0;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = $taxableAmount * (($request->tax_rate ?? 0) / 100);
            $totalAmount = $taxableAmount + $taxAmount;

            // Create invoice
            $invoice = Invoice::create([
                'invoice_number' => Invoice::generateInvoiceNumber(),
                'status' => $request->status,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'terms' => $request->terms,
                'billable_id' => $request->billable_id,
                'billable_type' => $billable::class,
                'user_id' => auth()->id(),
            ]);

            // Create invoice items
            foreach ($request->items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Invoice $invoice)
    {
        // Ensure user can only view their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        $invoice->load(['billable', 'items', 'payments']);

        return Inertia::render('Finance/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice)
    {
        // Ensure user can only edit their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing of draft invoices
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be edited.');
        }

        $invoice->load(['billable', 'items']);

        // Get clients and leads for billable selection
        $clients = Client::where('user_id', auth()->id())
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $leads = Lead::where('user_id', auth()->id())
            ->where('status', 'qualified')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $currencies = [
            'USD' => 'US Dollar',
            'EUR' => 'Euro',
            'GBP' => 'British Pound',
            'CAD' => 'Canadian Dollar',
            'AUD' => 'Australian Dollar',
            'JPY' => 'Japanese Yen',
        ];

        $statuses = [
            'draft' => 'Draft',
            'sent' => 'Sent'
        ];

        return Inertia::render('Finance/Invoices/Edit', [
            'invoice' => $invoice,
            'clients' => $clients,
            'leads' => $leads,
            'currencies' => $currencies,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Invoice $invoice)
    {
        // Ensure user can only update their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow editing of draft invoices
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be edited.');
        }

        $validator = Validator::make($request->all(), [
            'billable_type' => 'required|string|in:client,lead',
            'billable_id' => 'required|integer',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'currency' => 'required|string|max:3',
            'status' => 'required|string|in:draft,sent',
            'notes' => 'nullable|string|max:1000',
            'terms' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount_amount' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Verify billable entity ownership
        $billableClass = $request->billable_type === 'client' ? Client::class : Lead::class;
        $billable = $billableClass::where('id', $request->billable_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$billable) {
            return back()->with('error', 'Billable entity not found or access denied.');
        }

        DB::transaction(function () use ($request, $invoice, $billable) {
            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['quantity'] * $item['unit_price'];
            }

            $discountAmount = $request->discount_amount ?? 0;
            $taxableAmount = $subtotal - $discountAmount;
            $taxAmount = $taxableAmount * (($request->tax_rate ?? 0) / 100);
            $totalAmount = $taxableAmount + $taxAmount;

            // Update invoice
            $invoice->update([
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'currency' => $request->currency,
                'notes' => $request->notes,
                'terms' => $request->terms,
                'billable_id' => $request->billable_id,
                'billable_type' => $billable::class,
                'status' => $request->status,
            ]);

            // Delete existing items and create new ones
            $invoice->items()->delete();
            foreach ($request->items as $item) {
                $invoice->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total_price' => $item['quantity'] * $item['unit_price'],
                ]);
            }
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Invoice $invoice)
    {
        // Ensure user can only delete their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow deletion of draft invoices
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be deleted.');
        }

        // Check if invoice has payments
        if ($invoice->payments()->count() > 0) {
            return back()->with('error', 'Cannot delete invoice with existing payments.');
        }

        DB::transaction(function () use ($invoice) {
            // Delete invoice items first
            $invoice->items()->delete();

            // Delete the invoice
            $invoice->delete();
        });

        return redirect()->route('finance.invoices.index')
            ->with('success', 'Invoice deleted successfully.');
    }

    /**
     * Send the invoice to the client/lead.
     */
    public function send(Invoice $invoice)
    {
        // Ensure user can only send their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        // Only allow sending of draft invoices
        if ($invoice->status !== 'draft') {
            return back()->with('error', 'Only draft invoices can be sent.');
        }

        // Update invoice status to sent
        $invoice->update(['status' => 'sent']);

        // TODO: Implement email sending logic here
        // This would typically involve:
        // 1. Generating PDF
        // 2. Sending email with PDF attachment
        // 3. Logging the send action

        return back()->with('success', 'Invoice sent successfully.');
    }

    /**
     * Generate PDF for the invoice.
     */
    public function pdf(Invoice $invoice)
    {
        // Ensure user can only generate PDF for their own invoices
        if ($invoice->user_id !== auth()->id()) {
            abort(403);
        }

        $invoice->load(['billable', 'items']);

        // TODO: Implement PDF generation logic here
        // This would typically use a library like DomPDF or wkhtmltopdf
        // For now, return a simple response

        return response()->json([
            'message' => 'PDF generation not yet implemented',
            'invoice' => $invoice
        ]);
    }

    /**
     * Generate AI-powered invoice items.
     */
    public function generateItems(Request $request, FinanceAIService $financeAI)
    {
        $validator = Validator::make($request->all(), [
            'project_description' => 'required|string|max:1000',
            'estimated_value' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $result = $financeAI->generateInvoiceItems(
                $request->project_description,
                $request->estimated_value
            );

            if ($result) {
                return response()->json([
                    'success' => true,
                    'items' => $result['items'] ?? [],
                    'notes' => $result['notes'] ?? '',
                    'total_estimated' => $result['total_estimated'] ?? 0,
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Could not generate invoice items',
                ], 400);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice items',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
