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
            color: #f39c12;
            margin-bottom: 5px;
        }
        
        .reminder-badge {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        
        .urgency-notice {
            background-color: #fff3cd;
            border-left: 4px solid #f39c12;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .urgency-notice h3 {
            margin-top: 0;
            color: #856404;
        }
        
        .quotation-summary {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        
        .cta-button {
            display: inline-block;
            background-color: #f39c12;
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
        }
        
        .cta-button:hover {
            background-color: #e67e22;
        }
        
        .footer {
            border-top: 2px solid #e9ecef;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="company-name">{{ config('app.name', 'TekRem ERP') }}</div>
            <div class="reminder-badge">⏰ Quotation Reminder</div>
        </div>

        <!-- Content -->
        <div class="content">
            {!! nl2br(e($content['body'])) !!}
        </div>

        <!-- Urgency Notice -->
        <div class="urgency-notice">
            <h3>⚡ Time Sensitive</h3>
            <p>Your quotation <strong>{{ $quotation->quotation_number }}</strong> expires in 
            <strong>{{ $quotation->days_until_expiry }} day(s)</strong> on {{ $quotation->expiry_date->format('M d, Y') }}.</p>
        </div>

        <!-- Quotation Summary -->
        <div class="quotation-summary">
            <h3>📋 Quotation Details</h3>
            <p><strong>Quotation #:</strong> {{ $quotation->quotation_number }}</p>
            <p><strong>Total Amount:</strong> {{ number_format($quotation->total_amount, 2) }} {{ $quotation->currency }}</p>
            <p><strong>Valid Until:</strong> {{ $quotation->expiry_date->format('M d, Y') }}</p>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="cta-button">📞 Let's Discuss This Quotation</a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>We're here to help! Contact us at {{ config('company.email', 'info@tekrem.com') }} or {{ config('company.phone', '+1 (555) 123-4567') }}</p>
            <p>{{ config('app.name') }} • {{ now()->format('M d, Y') }}</p>
        </div>
    </div>
</body>
</html>
