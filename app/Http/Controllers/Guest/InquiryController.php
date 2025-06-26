<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestInquiry;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    /**
     * Show the inquiry form.
     */
    public function create(): Response
    {
        return Inertia::render('Guest/Inquiry/Create', [
            'inquiryTypes' => [
                'general' => 'General Inquiry',
                'sales' => 'Sales Inquiry',
                'partnership' => 'Partnership Opportunity',
                'other' => 'Other'
            ],
            'urgencyLevels' => [
                'low' => 'Low',
                'normal' => 'Normal',
                'high' => 'High',
                'urgent' => 'Urgent'
            ],
            'contactMethods' => [
                'email' => 'Email',
                'phone' => 'Phone',
                'both' => 'Both Email and Phone'
            ]
        ]);
    }

    /**
     * Store a new inquiry.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:general,sales,partnership,other',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'preferred_contact_method' => 'required|string|in:email,phone,both',
            'urgency' => 'required|string|in:low,normal,high,urgent',
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
            $inquiry = GuestInquiry::create($data);

            // Send notification to staff
            $this->notifyStaff($inquiry);

            return response()->json([
                'success' => true,
                'message' => 'Your inquiry has been submitted successfully. We will get back to you soon.',
                'reference_number' => $inquiry->reference_number
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your inquiry. Please try again.'
            ], 500);
        }
    }

    /**
     * Show inquiry status by reference number.
     */
    public function status(Request $request): Response|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_inquiries,reference_number'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return Inertia::render('Guest/Inquiry/Status', [
                'error' => 'Invalid reference number.'
            ]);
        }

        $inquiry = GuestInquiry::where('reference_number', $request->reference_number)
            ->with('assignedTo:id,name')
            ->first();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'inquiry' => [
                    'reference_number' => $inquiry->reference_number,
                    'type' => $inquiry->type,
                    'subject' => $inquiry->subject,
                    'status' => $inquiry->status,
                    'urgency' => $inquiry->urgency,
                    'created_at' => $inquiry->created_at,
                    'responded_at' => $inquiry->responded_at,
                    'assigned_to' => $inquiry->assignedTo?->name,
                ]
            ]);
        }

        return Inertia::render('Guest/Inquiry/Status', [
            'inquiry' => [
                'reference_number' => $inquiry->reference_number,
                'type' => $inquiry->type,
                'subject' => $inquiry->subject,
                'status' => $inquiry->status,
                'urgency' => $inquiry->urgency,
                'created_at' => $inquiry->created_at,
                'responded_at' => $inquiry->responded_at,
                'assigned_to' => $inquiry->assignedTo?->name,
            ]
        ]);
    }

    /**
     * Show the status check form.
     */
    public function statusForm(): Response
    {
        return Inertia::render('Guest/Inquiry/StatusCheck');
    }

    /**
     * Notify staff about new inquiry.
     */
    private function notifyStaff(GuestInquiry $inquiry): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Get users who should be notified based on inquiry type
            $users = $this->getUsersToNotify($inquiry->type);
            
            foreach ($users as $user) {
                $notificationService->send(
                    $user,
                    'New Guest Inquiry',
                    "New {$inquiry->type} inquiry from {$inquiry->name} - {$inquiry->subject}",
                    [
                        'type' => 'guest_inquiry',
                        'inquiry_id' => $inquiry->id,
                        'reference_number' => $inquiry->reference_number,
                        'urgency' => $inquiry->urgency
                    ]
                );
            }
        } catch (\Exception $e) {
            // Log error but don't fail the inquiry submission
            \Log::error('Failed to send inquiry notification: ' . $e->getMessage());
        }
    }

    /**
     * Get users to notify based on inquiry type.
     */
    private function getUsersToNotify(string $type): \Illuminate\Database\Eloquent\Collection
    {
        // Get users with appropriate permissions based on inquiry type
        return match($type) {
            'sales' => \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->orWhereHas('permissions', function($q) {
                $q->where('name', 'manage sales');
            })->get(),
            
            'partnership' => \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->get(),
            
            default => \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'staff']);
            })->orWhereHas('permissions', function($q) {
                $q->where('name', 'manage inquiries');
            })->get()
        };
    }
}
