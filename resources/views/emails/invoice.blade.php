<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $content['subject'] }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        
        .email-container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #dc3545;
            margin-bottom: 5px;
        }
        
        .company-tagline {
            color: #6c757d;
            font-size: 14px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .invoice-details {
            background-color: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .invoice-details h3 {
            margin-top: 0;
            color: #2c3e50;
            font-size: 18px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            color: #dc3545;
        }
        
        .payment-button {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
        }
        
        .payment-button:hover {
            background-color: #218838;
        }
        
        .footer {
            border-top: 2px solid #e9ecef;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        
        .payment-info {
            background-color: #e8f5e8;
            border: 1px solid #28a745;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .payment-info h4 {
            margin-top: 0;
            color: #155724;
        }
        
        .overdue-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .overdue-notice strong {
            color: #dc3545;
        }
        
        .contact-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .contact-info h4 {
            margin-top: 0;
            color: #2c3e50;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-left: 10px;
        }
        
        .status-paid {
            background-color: #d4edda;
            color: #155724;
        }
        
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        
        .status-overdue {
            background-color: #f8d7da;
            color: #721c24;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
            }
            
            .payment-button {
                padding: 12px 30px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">{{ config('app.name', 'TekRem ERP') }}</div>
            <div class="company-tagline">Professional Business Solutions</div>
        </div>

        <!-- Content -->
        <div class="content">
            {!! nl2br(e($content['body'])) !!}
        </div>

        <!-- Invoice Details -->
        <div class="invoice-details">
            <h3>🧾 Invoice Summary 
                <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </h3>
            <div class="detail-row">
                <span>Invoice Number:</span>
                <span><strong>{{ $invoice->invoice_number }}</strong></span>
            </div>
            <div class="detail-row">
                <span>Issue Date:</span>
                <span>{{ $invoice->issue_date->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span>Due Date:</span>
                <span>{{ $invoice->due_date->format('M d, Y') }}</span>
            </div>
            @if($invoice->paid_amount > 0)
                <div class="detail-row">
                    <span>Paid Amount:</span>
                    <span>{{ number_format($invoice->paid_amount, 2) }} {{ $invoice->currency }}</span>
                </div>
            @endif
            <div class="detail-row">
                <span>{{ $invoice->paid_amount > 0 ? 'Amount Due:' : 'Total Amount:' }}</span>
                <span>{{ number_format($invoice->total_amount - $invoice->paid_amount, 2) }} {{ $invoice->currency }}</span>
            </div>
        </div>

        <!-- Overdue Notice -->
        @if($invoice->status === 'overdue')
            <div class="overdue-notice">
                <strong>⚠️ Payment Overdue:</strong> This invoice was due on {{ $invoice->due_date->format('M d, Y') }}. 
                Please arrange payment immediately to avoid any service interruption.
            </div>
        @endif

        <!-- Payment Information -->
        @if($invoice->status !== 'paid')
            <div class="payment-info">
                <h4>💳 Payment Instructions</h4>
                <p><strong>Payment Methods Accepted:</strong></p>
                <ul>
                    <li>Bank Transfer</li>
                    <li>Credit Card</li>
                    <li>Online Payment Portal</li>
                    <li>Check (payable to {{ config('app.name') }})</li>
                </ul>
                <p><strong>Payment Reference:</strong> {{ $invoice->invoice_number }}</p>
            </div>

            <!-- Payment Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" class="payment-button">💰 Pay Now - {{ number_format($invoice->total_amount - $invoice->paid_amount, 2) }} {{ $invoice->currency }}</a>
            </div>
        @else
            <div class="payment-info">
                <h4>✅ Payment Received</h4>
                <p>Thank you! This invoice has been paid in full.</p>
            </div>
        @endif

        <!-- Items Preview -->
        @if($invoice->items->count() > 0)
            <div class="invoice-details">
                <h3>📦 Items Billed</h3>
                @foreach($invoice->items->take(3) as $item)
                    <div class="detail-row">
                        <span>{{ $item->description }}</span>
                        <span>{{ $item->quantity }} × {{ number_format($item->unit_price, 2) }} {{ $invoice->currency }}</span>
                    </div>
                @endforeach
                @if($invoice->items->count() > 3)
                    <div style="text-align: center; margin-top: 10px; color: #6c757d; font-style: italic;">
                        ... and {{ $invoice->items->count() - 3 }} more item(s). See attached PDF for complete details.
                    </div>
                @endif
            </div>
        @endif

        <!-- Contact Information -->
        <div class="contact-info">
            <h4>📞 Questions About This Invoice?</h4>
            <p>If you have any questions about this invoice or need assistance with payment, please contact us:</p>
            <p>
                <strong>Email:</strong> {{ config('company.email', 'billing@tekrem.com') }}<br>
                <strong>Phone:</strong> {{ config('company.phone', '+1 (555) 123-4567') }}<br>
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM
            </p>
        </div>

        <!-- Terms Reminder -->
        @if($invoice->terms)
            <div class="invoice-details">
                <h3>📋 Payment Terms</h3>
                <p style="margin: 0; white-space: pre-wrap;">{{ $invoice->terms }}</p>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>This invoice was sent from {{ config('app.name') }} on {{ now()->format('M d, Y \a\t H:i') }}</p>
            <p>{{ config('company.address', '123 Business Street, Business City, 12345') }}</p>
            @if(config('company.tax_number'))
                <p>Tax ID: {{ config('company.tax_number') }}</p>
            @endif
            <p>
                <a href="{{ config('company.website', '#') }}" style="color: #dc3545;">Visit our website</a> | 
                <a href="mailto:{{ config('company.email', 'info@tekrem.com') }}" style="color: #dc3545;">Contact us</a>
            </p>
            
            @if($content['generated_by'] === 'ai')
                <p style="margin-top: 15px; font-size: 10px; color: #adb5bd;">
                    ✨ This email content was intelligently generated to provide you with the most relevant information.
                </p>
            @endif
        </div>
    </div>
</body>
</html>
