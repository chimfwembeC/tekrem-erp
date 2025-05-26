<?php

namespace App\Services;

use App\Models\Finance\Quotation;
use App\Models\Finance\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfService
{
    /**
     * Generate PDF for quotation
     */
    public function generateQuotationPdf(Quotation $quotation, $download = false)
    {
        $quotation->load(['lead', 'items', 'user']);
        
        $data = [
            'quotation' => $quotation,
            'company' => $this->getCompanyInfo(),
            'type' => 'quotation'
        ];

        $pdf = Pdf::loadView('pdf.quotation', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
            ]);

        if ($download) {
            return $pdf->download("quotation-{$quotation->quotation_number}.pdf");
        }

        return $pdf->stream("quotation-{$quotation->quotation_number}.pdf");
    }

    /**
     * Generate PDF for invoice
     */
    public function generateInvoicePdf(Invoice $invoice, $download = false)
    {
        $invoice->load(['billable', 'items', 'user']);
        
        $data = [
            'invoice' => $invoice,
            'company' => $this->getCompanyInfo(),
            'type' => 'invoice'
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
            ]);

        if ($download) {
            return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
        }

        return $pdf->stream("invoice-{$invoice->invoice_number}.pdf");
    }

    /**
     * Save PDF to storage
     */
    public function saveQuotationPdf(Quotation $quotation, $path = null)
    {
        $quotation->load(['lead', 'items', 'user']);
        
        $data = [
            'quotation' => $quotation,
            'company' => $this->getCompanyInfo(),
            'type' => 'quotation'
        ];

        $pdf = Pdf::loadView('pdf.quotation', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
            ]);

        $filename = $path ?: "quotations/quotation-{$quotation->quotation_number}.pdf";
        Storage::disk('public')->put($filename, $pdf->output());

        return $filename;
    }

    /**
     * Save invoice PDF to storage
     */
    public function saveInvoicePdf(Invoice $invoice, $path = null)
    {
        $invoice->load(['billable', 'items', 'user']);
        
        $data = [
            'invoice' => $invoice,
            'company' => $this->getCompanyInfo(),
            'type' => 'invoice'
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'defaultFont' => 'sans-serif',
                'isRemoteEnabled' => true,
                'isHtml5ParserEnabled' => true,
            ]);

        $filename = $path ?: "invoices/invoice-{$invoice->invoice_number}.pdf";
        Storage::disk('public')->put($filename, $pdf->output());

        return $filename;
    }

    /**
     * Get company information
     */
    private function getCompanyInfo()
    {
        return [
            'name' => config('app.name', 'TekRem ERP'),
            'address' => config('company.address', '123 Business Street'),
            'city' => config('company.city', 'Business City'),
            'postal_code' => config('company.postal_code', '12345'),
            'country' => config('company.country', 'Country'),
            'phone' => config('company.phone', '+1 (555) 123-4567'),
            'email' => config('company.email', 'info@tekrem.com'),
            'website' => config('company.website', 'www.tekrem.com'),
            'tax_number' => config('company.tax_number', 'TAX123456789'),
            'logo' => config('company.logo', null),
        ];
    }

    /**
     * Format currency for PDF
     */
    public function formatCurrency($amount, $currency = 'USD')
    {
        return number_format($amount, 2) . ' ' . $currency;
    }

    /**
     * Generate batch PDFs for multiple quotations
     */
    public function generateBatchQuotationPdfs($quotations)
    {
        $files = [];
        
        foreach ($quotations as $quotation) {
            $filename = $this->saveQuotationPdf($quotation);
            $files[] = [
                'quotation_id' => $quotation->id,
                'filename' => $filename,
                'path' => Storage::disk('public')->path($filename)
            ];
        }

        return $files;
    }

    /**
     * Generate batch PDFs for multiple invoices
     */
    public function generateBatchInvoicePdfs($invoices)
    {
        $files = [];
        
        foreach ($invoices as $invoice) {
            $filename = $this->saveInvoicePdf($invoice);
            $files[] = [
                'invoice_id' => $invoice->id,
                'filename' => $filename,
                'path' => Storage::disk('public')->path($filename)
            ];
        }

        return $files;
    }
}
