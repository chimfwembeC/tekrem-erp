<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Information
    |--------------------------------------------------------------------------
    |
    | This file contains the company information used throughout the application,
    | particularly for PDF generation, email templates, and invoicing.
    |
    */

    'name' => env('COMPANY_NAME', 'TekRem ERP'),
    'address' => env('COMPANY_ADDRESS', '123 Business Street'),
    'city' => env('COMPANY_CITY', 'Business City'),
    'postal_code' => env('COMPANY_POSTAL_CODE', '12345'),
    'country' => env('COMPANY_COUNTRY', 'United States'),
    'phone' => env('COMPANY_PHONE', '+1 (555) 123-4567'),
    'email' => env('COMPANY_EMAIL', 'info@tekrem.com'),
    'website' => env('COMPANY_WEBSITE', 'www.tekrem.com'),
    'tax_number' => env('COMPANY_TAX_NUMBER', 'TAX123456789'),
    'logo' => env('COMPANY_LOGO', null),

    /*
    |--------------------------------------------------------------------------
    | Banking Information
    |--------------------------------------------------------------------------
    |
    | Banking details for payment instructions on invoices.
    |
    */

    'bank' => [
        'name' => env('COMPANY_BANK_NAME', 'Business Bank'),
        'account_name' => env('COMPANY_BANK_ACCOUNT_NAME', 'TekRem ERP'),
        'account_number' => env('COMPANY_BANK_ACCOUNT_NUMBER', '1234567890'),
        'routing_number' => env('COMPANY_BANK_ROUTING_NUMBER', '123456789'),
        'swift_code' => env('COMPANY_BANK_SWIFT_CODE', 'BANKUS33'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for financial documents.
    |
    */

    'defaults' => [
        'currency' => env('COMPANY_DEFAULT_CURRENCY', 'USD'),
        'tax_rate' => env('COMPANY_DEFAULT_TAX_RATE', 0),
        'payment_terms' => env('COMPANY_DEFAULT_PAYMENT_TERMS', 'Net 30'),
        'quotation_validity_days' => env('COMPANY_QUOTATION_VALIDITY_DAYS', 30),
        'invoice_due_days' => env('COMPANY_INVOICE_DUE_DAYS', 30),
    ],

];
