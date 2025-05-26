<?php

namespace App\Services;

use App\Models\Finance\Quotation;
use App\Models\Finance\Invoice;
use App\Services\AiEmailService;
use App\Services\PdfService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class EmailService
{
    protected $aiEmailService;
    protected $pdfService;

    public function __construct(AiEmailService $aiEmailService, PdfService $pdfService)
    {
        $this->aiEmailService = $aiEmailService;
        $this->pdfService = $pdfService;
    }

    /**
     * Send quotation email
     */
    public function sendQuotationEmail(Quotation $quotation, $customContent = null)
    {
        try {
            // Generate AI content if not provided
            $emailContent = $customContent ?: $this->aiEmailService->generateQuotationEmail($quotation, 'send');
            
            // Generate PDF
            $pdfPath = $this->pdfService->saveQuotationPdf($quotation);
            $pdfFullPath = Storage::disk('public')->path($pdfPath);
            
            // Send email
            Mail::send('emails.quotation', [
                'quotation' => $quotation,
                'content' => $emailContent,
            ], function ($message) use ($quotation, $emailContent, $pdfFullPath) {
                $message->to($quotation->lead->email, $quotation->lead->name)
                        ->subject($emailContent['subject'])
                        ->attach($pdfFullPath, [
                            'as' => "quotation-{$quotation->quotation_number}.pdf",
                            'mime' => 'application/pdf',
                        ]);
            });

            // Update quotation status
            if ($quotation->status === 'draft') {
                $quotation->update(['status' => 'sent']);
            }

            // Log the email
            $this->logEmailSent('quotation', $quotation->id, $quotation->lead->email, $emailContent);

            return [
                'success' => true,
                'message' => 'Quotation email sent successfully',
                'email_content' => $emailContent,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send quotation email: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send invoice email
     */
    public function sendInvoiceEmail(Invoice $invoice, $customContent = null)
    {
        try {
            // Generate AI content if not provided
            $emailContent = $customContent ?: $this->aiEmailService->generateInvoiceEmail($invoice, 'send');
            
            // Generate PDF
            $pdfPath = $this->pdfService->saveInvoicePdf($invoice);
            $pdfFullPath = Storage::disk('public')->path($pdfPath);
            
            // Send email
            Mail::send('emails.invoice', [
                'invoice' => $invoice,
                'content' => $emailContent,
            ], function ($message) use ($invoice, $emailContent, $pdfFullPath) {
                $recipientEmail = $invoice->billable->email ?? null;
                $recipientName = $invoice->billable->name ?? 'Valued Client';
                
                if ($recipientEmail) {
                    $message->to($recipientEmail, $recipientName)
                            ->subject($emailContent['subject'])
                            ->attach($pdfFullPath, [
                                'as' => "invoice-{$invoice->invoice_number}.pdf",
                                'mime' => 'application/pdf',
                            ]);
                }
            });

            // Update invoice status
            if ($invoice->status === 'draft') {
                $invoice->update(['status' => 'sent']);
            }

            // Log the email
            $this->logEmailSent('invoice', $invoice->id, $invoice->billable->email ?? 'unknown', $emailContent);

            return [
                'success' => true,
                'message' => 'Invoice email sent successfully',
                'email_content' => $emailContent,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send invoice email: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send quotation reminder email
     */
    public function sendQuotationReminder(Quotation $quotation)
    {
        try {
            $emailContent = $this->aiEmailService->generateQuotationEmail($quotation, 'reminder');
            
            Mail::send('emails.quotation-reminder', [
                'quotation' => $quotation,
                'content' => $emailContent,
            ], function ($message) use ($quotation, $emailContent) {
                $message->to($quotation->lead->email, $quotation->lead->name)
                        ->subject($emailContent['subject']);
            });

            $this->logEmailSent('quotation_reminder', $quotation->id, $quotation->lead->email, $emailContent);

            return [
                'success' => true,
                'message' => 'Quotation reminder sent successfully',
                'email_content' => $emailContent,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send quotation reminder: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send reminder: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send invoice follow-up email
     */
    public function sendInvoiceFollowUp(Invoice $invoice, $followUpNumber = 1)
    {
        try {
            $emailContent = $this->aiEmailService->generateFollowUpEmail($invoice, $followUpNumber);
            
            Mail::send('emails.invoice-followup', [
                'invoice' => $invoice,
                'content' => $emailContent,
                'followUpNumber' => $followUpNumber,
            ], function ($message) use ($invoice, $emailContent) {
                $recipientEmail = $invoice->billable->email ?? null;
                $recipientName = $invoice->billable->name ?? 'Valued Client';
                
                if ($recipientEmail) {
                    $message->to($recipientEmail, $recipientName)
                            ->subject($emailContent['subject']);
                }
            });

            $this->logEmailSent('invoice_followup', $invoice->id, $invoice->billable->email ?? 'unknown', $emailContent);

            return [
                'success' => true,
                'message' => 'Follow-up email sent successfully',
                'email_content' => $emailContent,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send invoice follow-up: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send follow-up: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send payment thank you email
     */
    public function sendPaymentThankYou(Invoice $invoice)
    {
        try {
            $emailContent = $this->aiEmailService->generatePaymentThankYouEmail($invoice);
            
            Mail::send('emails.payment-thankyou', [
                'invoice' => $invoice,
                'content' => $emailContent,
            ], function ($message) use ($invoice, $emailContent) {
                $recipientEmail = $invoice->billable->email ?? null;
                $recipientName = $invoice->billable->name ?? 'Valued Client';
                
                if ($recipientEmail) {
                    $message->to($recipientEmail, $recipientName)
                            ->subject($emailContent['subject']);
                }
            });

            $this->logEmailSent('payment_thankyou', $invoice->id, $invoice->billable->email ?? 'unknown', $emailContent);

            return [
                'success' => true,
                'message' => 'Thank you email sent successfully',
                'email_content' => $emailContent,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to send payment thank you: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Failed to send thank you email: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Generate email preview
     */
    public function generateEmailPreview($type, $model, $customContent = null)
    {
        try {
            switch ($type) {
                case 'quotation_send':
                    return $customContent ?: $this->aiEmailService->generateQuotationEmail($model, 'send');
                    
                case 'quotation_reminder':
                    return $customContent ?: $this->aiEmailService->generateQuotationEmail($model, 'reminder');
                    
                case 'invoice_send':
                    return $customContent ?: $this->aiEmailService->generateInvoiceEmail($model, 'send');
                    
                case 'invoice_followup':
                    $followUpNumber = request('follow_up_number', 1);
                    return $customContent ?: $this->aiEmailService->generateFollowUpEmail($model, $followUpNumber);
                    
                case 'payment_thankyou':
                    return $customContent ?: $this->aiEmailService->generatePaymentThankYouEmail($model);
                    
                default:
                    throw new \Exception('Invalid email type');
            }
        } catch (\Exception $e) {
            Log::error('Failed to generate email preview: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send bulk emails
     */
    public function sendBulkEmails($type, $models, $customContent = null)
    {
        $results = [];
        
        foreach ($models as $model) {
            try {
                switch ($type) {
                    case 'quotation_reminder':
                        $result = $this->sendQuotationReminder($model);
                        break;
                        
                    case 'invoice_followup':
                        $result = $this->sendInvoiceFollowUp($model);
                        break;
                        
                    default:
                        $result = ['success' => false, 'message' => 'Invalid bulk email type'];
                }
                
                $results[] = [
                    'model_id' => $model->id,
                    'success' => $result['success'],
                    'message' => $result['message'],
                ];
                
                // Add delay to avoid rate limiting
                sleep(1);
                
            } catch (\Exception $e) {
                $results[] = [
                    'model_id' => $model->id,
                    'success' => false,
                    'message' => $e->getMessage(),
                ];
            }
        }
        
        return $results;
    }

    /**
     * Log email sent
     */
    private function logEmailSent($type, $modelId, $recipient, $content)
    {
        Log::info("Email sent: {$type}", [
            'model_id' => $modelId,
            'recipient' => $recipient,
            'subject' => $content['subject'],
            'generated_by' => $content['generated_by'] ?? 'unknown',
        ]);
    }
}
