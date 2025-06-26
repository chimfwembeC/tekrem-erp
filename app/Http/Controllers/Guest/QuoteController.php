<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestQuoteRequest;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class QuoteController extends Controller
{
    /**
     * Show the quote request form.
     */
    public function create(): Response
    {
        return Inertia::render('Guest/Quote/Create', [
            'serviceTypes' => [
                'web_development' => 'Web Development',
                'mobile_app' => 'Mobile App Development',
                'ai_solution' => 'AI Solutions',
                'consulting' => 'IT Consulting',
                'custom' => 'Custom Solution'
            ],
            'budgetRanges' => [
                'under_5k' => 'Under $5,000',
                '5k_10k' => '$5,000 - $10,000',
                '10k_25k' => '$10,000 - $25,000',
                '25k_50k' => '$25,000 - $50,000',
                '50k_plus' => '$50,000+'
            ],
            'timelines' => [
                'asap' => 'ASAP',
                '1_month' => '1 Month',
                '3_months' => '3 Months',
                '6_months' => '6 Months',
                'flexible' => 'Flexible'
            ],
            'priorities' => [
                'low' => 'Low',
                'normal' => 'Normal',
                'high' => 'High',
                'urgent' => 'Urgent'
            ]
        ]);
    }

    /**
     * Store a new quote request.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'service_type' => 'required|string|in:web_development,mobile_app,ai_solution,consulting,custom',
            'project_description' => 'required|string|max:5000',
            'budget_range' => 'nullable|string|in:under_5k,5k_10k,10k_25k,25k_50k,50k_plus',
            'timeline' => 'nullable|string|in:asap,1_month,3_months,6_months,flexible',
            'requirements' => 'nullable|array',
            'requirements.*' => 'string|max:500',
            'features' => 'nullable|array',
            'features.*' => 'string|max:500',
            'priority' => 'required|string|in:low,normal,high,urgent',
            'source' => 'nullable|string|max:100',
            'utm_source' => 'nullable|string|max:100',
            'utm_medium' => 'nullable|string|max:100',
            'utm_campaign' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Prepare metadata
        $metadata = [];
        if ($request->filled('utm_source')) {
            $metadata['utm_source'] = $request->utm_source;
        }
        if ($request->filled('utm_medium')) {
            $metadata['utm_medium'] = $request->utm_medium;
        }
        if ($request->filled('utm_campaign')) {
            $metadata['utm_campaign'] = $request->utm_campaign;
        }
        if ($request->filled('referrer')) {
            $metadata['referrer'] = $request->referrer;
        }
        
        $data['metadata'] = $metadata;
        $data['source'] = $data['source'] ?? 'website';

        try {
            $quoteRequest = GuestQuoteRequest::create($data);

            // Send notification to staff
            $this->notifyStaff($quoteRequest);

            return response()->json([
                'success' => true,
                'message' => 'Your quote request has been submitted successfully. We will prepare a detailed quote and get back to you soon.',
                'reference_number' => $quoteRequest->reference_number
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your quote request. Please try again.'
            ], 500);
        }
    }

    /**
     * Show quote status by reference number.
     */
    public function status(Request $request): Response|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_quote_requests,reference_number'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return Inertia::render('Guest/Quote/Status', [
                'error' => 'Invalid reference number.'
            ]);
        }

        $quoteRequest = GuestQuoteRequest::where('reference_number', $request->reference_number)
            ->with('assignedTo:id,name')
            ->first();

        $quoteData = [
            'reference_number' => $quoteRequest->reference_number,
            'service_type' => $quoteRequest->service_type,
            'status' => $quoteRequest->status,
            'priority' => $quoteRequest->priority,
            'created_at' => $quoteRequest->created_at,
            'quoted_at' => $quoteRequest->quoted_at,
            'quoted_amount' => $quoteRequest->quoted_amount,
            'quoted_currency' => $quoteRequest->quoted_currency,
            'quote_expires_at' => $quoteRequest->quote_expires_at,
            'quote_notes' => $quoteRequest->quote_notes,
            'assigned_to' => $quoteRequest->assignedTo?->name,
            'is_quote_expired' => $quoteRequest->isQuoteExpired(),
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'quote_request' => $quoteData
            ]);
        }

        return Inertia::render('Guest/Quote/Status', [
            'quoteRequest' => $quoteData
        ]);
    }

    /**
     * Show the status check form.
     */
    public function statusForm(): Response
    {
        return Inertia::render('Guest/Quote/StatusCheck');
    }

    /**
     * Accept a quote.
     */
    public function accept(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_quote_requests,reference_number'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $quoteRequest = GuestQuoteRequest::where('reference_number', $request->reference_number)
            ->where('status', 'quoted')
            ->first();

        if (!$quoteRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Quote not found or not available for acceptance.'
            ], 404);
        }

        if ($quoteRequest->isQuoteExpired()) {
            return response()->json([
                'success' => false,
                'message' => 'This quote has expired. Please request a new quote.'
            ], 400);
        }

        try {
            $quoteRequest->update(['status' => 'accepted']);

            // Notify staff about quote acceptance
            $this->notifyQuoteAcceptance($quoteRequest);

            return response()->json([
                'success' => true,
                'message' => 'Quote accepted successfully. Our team will contact you to proceed with the project.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while accepting the quote. Please try again.'
            ], 500);
        }
    }

    /**
     * Notify staff about new quote request.
     */
    private function notifyStaff(GuestQuoteRequest $quoteRequest): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Get sales team and managers
            $users = \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->orWhereHas('permissions', function($q) {
                $q->whereIn('name', ['manage quotes', 'manage sales']);
            })->get();
            
            foreach ($users as $user) {
                $notificationService->send(
                    $user,
                    'New Quote Request',
                    "New {$quoteRequest->service_type} quote request from {$quoteRequest->name}",
                    [
                        'type' => 'guest_quote_request',
                        'quote_request_id' => $quoteRequest->id,
                        'reference_number' => $quoteRequest->reference_number,
                        'priority' => $quoteRequest->priority,
                        'budget_range' => $quoteRequest->budget_range
                    ]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send quote request notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify staff about quote acceptance.
     */
    private function notifyQuoteAcceptance(GuestQuoteRequest $quoteRequest): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Notify assigned user and managers
            $users = collect();
            if ($quoteRequest->assignedTo) {
                $users->push($quoteRequest->assignedTo);
            }
            
            $managers = \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->get();
            
            $users = $users->merge($managers)->unique('id');
            
            foreach ($users as $user) {
                $notificationService->send(
                    $user,
                    'Quote Accepted',
                    "Quote {$quoteRequest->reference_number} has been accepted by {$quoteRequest->name}",
                    [
                        'type' => 'quote_accepted',
                        'quote_request_id' => $quoteRequest->id,
                        'reference_number' => $quoteRequest->reference_number,
                        'quoted_amount' => $quoteRequest->quoted_amount
                    ]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send quote acceptance notification: ' . $e->getMessage());
        }
    }
}
