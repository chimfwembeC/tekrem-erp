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
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .company-tagline {
            color: #6c757d;
            font-size: 14px;
        }
        
        .content {
            margin-bottom: 30px;
        }
        
        .quotation-details {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .quotation-details h3 {
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
            color: #007bff;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
        }
        
        .cta-button:hover {
            background-color: #0056b3;
        }
        
        .footer {
            border-top: 2px solid #e9ecef;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
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
        
        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .expiry-notice strong {
            color: #d63031;
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

        <!-- Quotation Details -->
        <div class="quotation-details">
            <h3>📋 Quotation Summary</h3>
            <div class="detail-row">
                <span>Quotation Number:</span>
                <span><strong>{{ $quotation->quotation_number }}</strong></span>
            </div>
            <div class="detail-row">
                <span>Issue Date:</span>
                <span>{{ $quotation->issue_date->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span>Valid Until:</span>
                <span>{{ $quotation->expiry_date->format('M d, Y') }}</span>
            </div>
            <div class="detail-row">
                <span>Total Amount:</span>
                <span>{{ number_format($quotation->total_amount, 2) }} {{ $quotation->currency }}</span>
            </div>
        </div>

        <!-- Expiry Notice -->
        @if($quotation->days_until_expiry <= 7)
            <div class="expiry-notice">
                <strong>⏰ Time Sensitive:</strong> This quotation expires in {{ $quotation->days_until_expiry }} day(s). 
                Please review and respond at your earliest convenience.
            </div>
        @endif

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="cta-button">📄 View Attached Quotation</a>
        </div>

        <!-- Contact Information -->
        <div class="contact-info">
            <h4>📞 Need Assistance?</h4>
            <p>If you have any questions about this quotation or need clarification on any items, please don't hesitate to contact us:</p>
            <p>
                <strong>Email:</strong> {{ config('company.email', 'info@tekrem.com') }}<br>
                <strong>Phone:</strong> {{ config('company.phone', '+1 (555) 123-4567') }}<br>
                <strong>Website:</strong> {{ config('company.website', 'www.tekrem.com') }}
            </p>
        </div>

        <!-- Items Preview -->
        @if($quotation->items->count() > 0)
            <div class="quotation-details">
                <h3>📦 Items Included</h3>
                @foreach($quotation->items->take(3) as $item)
                    <div class="detail-row">
                        <span>{{ $item->description }}</span>
                        <span>{{ $item->quantity }} × {{ number_format($item->unit_price, 2) }} {{ $quotation->currency }}</span>
                    </div>
                @endforeach
                @if($quotation->items->count() > 3)
                    <div style="text-align: center; margin-top: 10px; color: #6c757d; font-style: italic;">
                        ... and {{ $quotation->items->count() - 3 }} more item(s). See attached PDF for complete details.
                    </div>
                @endif
            </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>This email was sent from {{ config('app.name') }} on {{ now()->format('M d, Y \a\t H:i') }}</p>
            <p>{{ config('company.address', '123 Business Street, Business City, 12345') }}</p>
            <p>
                <a href="{{ config('company.website', '#') }}" style="color: #007bff;">Visit our website</a> | 
                <a href="mailto:{{ config('company.email', 'info@tekrem.com') }}" style="color: #007bff;">Contact us</a>
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
