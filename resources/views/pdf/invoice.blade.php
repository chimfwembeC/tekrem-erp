<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .company-details {
            color: #6b7280;
            line-height: 1.6;
        }
        
        .invoice-info {
            text-align: right;
            flex: 1;
        }
        
        .invoice-title {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .invoice-date {
            color: #6b7280;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 10px;
        }
        
        .status-draft { background-color: #f3f4f6; color: #374151; }
        .status-sent { background-color: #dbeafe; color: #1e40af; }
        .status-paid { background-color: #d1fae5; color: #065f46; }
        .status-overdue { background-color: #fee2e2; color: #991b1b; }
        .status-cancelled { background-color: #f3f4f6; color: #6b7280; }
        
        .client-section {
            margin: 30px 0;
            display: flex;
            justify-content: space-between;
        }
        
        .bill-to, .invoice-details {
            flex: 1;
            margin-right: 20px;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .client-info {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #dc2626;
        }
        
        .client-name {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .items-table th {
            background-color: #fef2f2;
            color: #374151;
            font-weight: bold;
            padding: 12px;
            text-align: left;
            border-bottom: 2px solid #e5e7eb;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #f3f4f6;
            vertical-align: top;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:nth-child(even) {
            background-color: #fafafa;
        }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .font-medium {
            font-weight: 600;
        }
        
        .totals-section {
            margin-top: 30px;
            display: flex;
            justify-content: flex-end;
        }
        
        .totals-table {
            width: 300px;
            border-collapse: collapse;
        }
        
        .totals-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .totals-table .total-row {
            background-color: #dc2626;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        
        .payment-info {
            margin-top: 30px;
            background-color: #f0f9ff;
            border: 1px solid #0ea5e9;
            border-radius: 8px;
            padding: 15px;
        }
        
        .payment-status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
        }
        
        .payment-status.paid {
            background-color: #d1fae5;
            border: 1px solid #10b981;
            color: #065f46;
        }
        
        .payment-status.pending {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
        }
        
        .payment-status.overdue {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
        }
        
        .notes-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        .notes-content {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-top: 10px;
            white-space: pre-wrap;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
        }
        
        .overdue-warning {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
            padding: 10px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 11px;
        }
        
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-name">{{ $company['name'] }}</div>
                <div class="company-details">
                    {{ $company['address'] }}<br>
                    {{ $company['city'] }}, {{ $company['postal_code'] }}<br>
                    {{ $company['country'] }}<br>
                    <strong>Phone:</strong> {{ $company['phone'] }}<br>
                    <strong>Email:</strong> {{ $company['email'] }}<br>
                    @if($company['tax_number'])
                        <strong>Tax ID:</strong> {{ $company['tax_number'] }}
                    @endif
                </div>
            </div>
            <div class="invoice-info">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-number"># {{ $invoice->invoice_number }}</div>
                <div class="invoice-date">
                    <strong>Issue Date:</strong> {{ $invoice->issue_date->format('M d, Y') }}<br>
                    <strong>Due Date:</strong> {{ $invoice->due_date->format('M d, Y') }}
                </div>
                <div class="status-badge status-{{ $invoice->status }}">
                    {{ ucfirst($invoice->status) }}
                </div>
            </div>
        </div>

        <!-- Overdue Warning -->
        @if($invoice->status === 'overdue')
            <div class="overdue-warning">
                <strong>⚠️ OVERDUE:</strong> This invoice was due on {{ $invoice->due_date->format('M d, Y') }}
            </div>
        @endif

        <!-- Client and Invoice Details -->
        <div class="client-section">
            <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div class="client-info">
                    @if($invoice->billable)
                        <div class="client-name">{{ $invoice->billable->name }}</div>
                        <div>{{ $invoice->billable->email }}</div>
                        @if(isset($invoice->billable->phone))
                            <div>{{ $invoice->billable->phone }}</div>
                        @endif
                        @if(isset($invoice->billable->address))
                            <div>{{ $invoice->billable->address }}</div>
                        @endif
                    @else
                        <div class="client-name">No client assigned</div>
                    @endif
                </div>
            </div>
            <div class="invoice-details">
                <div class="section-title">Invoice Details</div>
                <div class="client-info">
                    <div><strong>Currency:</strong> {{ $invoice->currency }}</div>
                    <div><strong>Payment Terms:</strong> Net 30</div>
                    <div><strong>Created By:</strong> {{ $invoice->user->name ?? 'System' }}</div>
                    @php
                        $remainingAmount = $invoice->total_amount - $invoice->paid_amount;
                    @endphp
                    <div><strong>Amount Due:</strong> {{ number_format($remainingAmount, 2) }} {{ $invoice->currency }}</div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 50%">Description</th>
                    <th style="width: 15%" class="text-center">Qty</th>
                    <th style="width: 17.5%" class="text-right">Unit Price</th>
                    <th style="width: 17.5%" class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach($invoice->items as $item)
                    <tr>
                        <td class="font-medium">{{ $item->description }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->unit_price, 2) }} {{ $invoice->currency }}</td>
                        <td class="text-right font-medium">{{ number_format($item->total_price, 2) }} {{ $invoice->currency }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">{{ number_format($invoice->subtotal, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @if($invoice->tax_amount > 0)
                    <tr>
                        <td>Tax:</td>
                        <td class="text-right">{{ number_format($invoice->tax_amount, 2) }} {{ $invoice->currency }}</td>
                    </tr>
                @endif
                @if($invoice->discount_amount > 0)
                    <tr>
                        <td>Discount:</td>
                        <td class="text-right">-{{ number_format($invoice->discount_amount, 2) }} {{ $invoice->currency }}</td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td>TOTAL:</td>
                    <td class="text-right">{{ number_format($invoice->total_amount, 2) }} {{ $invoice->currency }}</td>
                </tr>
                @if($invoice->paid_amount > 0)
                    <tr>
                        <td>Paid:</td>
                        <td class="text-right">{{ number_format($invoice->paid_amount, 2) }} {{ $invoice->currency }}</td>
                    </tr>
                    <tr style="background-color: #f3f4f6; font-weight: bold;">
                        <td>Amount Due:</td>
                        <td class="text-right">{{ number_format($remainingAmount, 2) }} {{ $invoice->currency }}</td>
                    </tr>
                @endif
            </table>
        </div>

        <!-- Payment Status -->
        @php
            $paymentClass = 'pending';
            $paymentMessage = 'Payment is pending';
            
            if ($invoice->status === 'paid') {
                $paymentClass = 'paid';
                $paymentMessage = 'This invoice has been paid in full';
            } elseif ($invoice->status === 'overdue') {
                $paymentClass = 'overdue';
                $paymentMessage = 'This invoice is overdue. Please remit payment immediately.';
            }
        @endphp
        
        <div class="payment-status {{ $paymentClass }}">
            <strong>Payment Status:</strong> {{ $paymentMessage }}
        </div>

        <!-- Payment Information -->
        <div class="payment-info">
            <div class="section-title">Payment Information</div>
            <p><strong>Please make payment to:</strong></p>
            <p>{{ $company['name'] }}</p>
            <p>Email: {{ $company['email'] }}</p>
            <p>Phone: {{ $company['phone'] }}</p>
            @if($company['tax_number'])
                <p>Tax ID: {{ $company['tax_number'] }}</p>
            @endif
        </div>

        <!-- Notes and Terms -->
        @if($invoice->notes || $invoice->terms)
            <div class="notes-section">
                @if($invoice->notes)
                    <div class="section-title">Notes</div>
                    <div class="notes-content">{{ $invoice->notes }}</div>
                @endif
                
                @if($invoice->terms)
                    <div class="section-title" style="margin-top: 20px;">Terms & Conditions</div>
                    <div class="notes-content">{{ $invoice->terms }}</div>
                @endif
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>This invoice was generated on {{ now()->format('M d, Y \a\t H:i') }}</p>
            <p>{{ $company['name'] }} • {{ $company['email'] }} • {{ $company['phone'] }}</p>
            @if($company['website'])
                <p>{{ $company['website'] }}</p>
            @endif
        </div>
    </div>
</body>
</html>
