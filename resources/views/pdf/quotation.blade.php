<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation {{ $quotation->quotation_number }}</title>
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
        
        .quotation-info {
            text-align: right;
            flex: 1;
        }
        
        .quotation-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .quotation-number {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 5px;
        }
        
        .quotation-date {
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
        .status-accepted { background-color: #d1fae5; color: #065f46; }
        .status-rejected { background-color: #fee2e2; color: #991b1b; }
        .status-expired { background-color: #fed7aa; color: #9a3412; }
        
        .client-section {
            margin: 30px 0;
            display: flex;
            justify-content: space-between;
        }
        
        .bill-to, .quotation-details {
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
            border-left: 4px solid #3b82f6;
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
            background-color: #f8fafc;
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
            background-color: #1f2937;
            color: white;
            font-weight: bold;
            font-size: 14px;
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
        
        .expiry-warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            color: #92400e;
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
            <div class="quotation-info">
                <div class="quotation-title">QUOTATION</div>
                <div class="quotation-number"># {{ $quotation->quotation_number }}</div>
                <div class="quotation-date">
                    <strong>Issue Date:</strong> {{ $quotation->issue_date->format('M d, Y') }}<br>
                    <strong>Expiry Date:</strong> {{ $quotation->expiry_date->format('M d, Y') }}
                </div>
                <div class="status-badge status-{{ $quotation->status }}">
                    {{ ucfirst($quotation->status) }}
                </div>
            </div>
        </div>

        <!-- Expiry Warning -->
        @if($quotation->is_expired)
            <div class="expiry-warning">
                <strong>⚠️ EXPIRED:</strong> This quotation expired on {{ $quotation->expiry_date->format('M d, Y') }}
            </div>
        @elseif($quotation->days_until_expiry <= 7 && $quotation->status === 'sent')
            <div class="expiry-warning">
                <strong>⏰ EXPIRES SOON:</strong> This quotation expires in {{ $quotation->days_until_expiry }} day(s)
            </div>
        @endif

        <!-- Client and Quotation Details -->
        <div class="client-section">
            <div class="bill-to">
                <div class="section-title">Quote To</div>
                <div class="client-info">
                    <div class="client-name">{{ $quotation->lead->name }}</div>
                    @if($quotation->lead->company)
                        <div>{{ $quotation->lead->company }}</div>
                    @endif
                    <div>{{ $quotation->lead->email }}</div>
                    @if($quotation->lead->phone)
                        <div>{{ $quotation->lead->phone }}</div>
                    @endif
                </div>
            </div>
            <div class="quotation-details">
                <div class="section-title">Quotation Details</div>
                <div class="client-info">
                    <div><strong>Currency:</strong> {{ $quotation->currency }}</div>
                    <div><strong>Valid Until:</strong> {{ $quotation->expiry_date->format('M d, Y') }}</div>
                    <div><strong>Created By:</strong> {{ $quotation->user->name }}</div>
                    @if($quotation->is_converted)
                        <div><strong>Status:</strong> Converted to Invoice</div>
                    @endif
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
                @foreach($quotation->items as $item)
                    <tr>
                        <td class="font-medium">{{ $item->description }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->unit_price, 2) }} {{ $quotation->currency }}</td>
                        <td class="text-right font-medium">{{ number_format($item->total_price, 2) }} {{ $quotation->currency }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">{{ number_format($quotation->subtotal, 2) }} {{ $quotation->currency }}</td>
                </tr>
                @if($quotation->tax_amount > 0)
                    <tr>
                        <td>Tax:</td>
                        <td class="text-right">{{ number_format($quotation->tax_amount, 2) }} {{ $quotation->currency }}</td>
                    </tr>
                @endif
                @if($quotation->discount_amount > 0)
                    <tr>
                        <td>Discount:</td>
                        <td class="text-right">-{{ number_format($quotation->discount_amount, 2) }} {{ $quotation->currency }}</td>
                    </tr>
                @endif
                <tr class="total-row">
                    <td>TOTAL:</td>
                    <td class="text-right">{{ number_format($quotation->total_amount, 2) }} {{ $quotation->currency }}</td>
                </tr>
            </table>
        </div>

        <!-- Notes and Terms -->
        @if($quotation->notes || $quotation->terms)
            <div class="notes-section">
                @if($quotation->notes)
                    <div class="section-title">Notes</div>
                    <div class="notes-content">{{ $quotation->notes }}</div>
                @endif
                
                @if($quotation->terms)
                    <div class="section-title" style="margin-top: 20px;">Terms & Conditions</div>
                    <div class="notes-content">{{ $quotation->terms }}</div>
                @endif
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>This quotation was generated on {{ now()->format('M d, Y \a\t H:i') }}</p>
            <p>{{ $company['name'] }} • {{ $company['email'] }} • {{ $company['phone'] }}</p>
            @if($company['website'])
                <p>{{ $company['website'] }}</p>
            @endif
        </div>
    </div>
</body>
</html>
