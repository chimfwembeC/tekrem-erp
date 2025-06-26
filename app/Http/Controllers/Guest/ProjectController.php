<?php

namespace App\Http\Controllers\Guest;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestProjectInquiry;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Show the project inquiry form.
     */
    public function create(): Response
    {
        return Inertia::render('Guest/Project/Create', [
            'projectTypes' => [
                'web_development' => 'Web Development',
                'mobile_app' => 'Mobile App Development',
                'ai_solution' => 'AI Solutions',
                'consulting' => 'IT Consulting',
                'custom' => 'Custom Solution'
            ],
            'projectCategories' => [
                'e-commerce' => 'E-commerce',
                'corporate' => 'Corporate Website',
                'portfolio' => 'Portfolio/Personal',
                'blog' => 'Blog/News',
                'saas' => 'SaaS Platform',
                'marketplace' => 'Marketplace',
                'educational' => 'Educational Platform',
                'healthcare' => 'Healthcare System',
                'fintech' => 'Financial Technology',
                'other' => 'Other'
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
     * Store a new project inquiry.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'project_type' => 'required|string|in:web_development,mobile_app,ai_solution,consulting,custom',
            'project_category' => 'nullable|string|max:100',
            'project_title' => 'required|string|max:255',
            'project_description' => 'required|string|max:5000',
            'project_goals' => 'nullable|array',
            'project_goals.*' => 'string|max:500',
            'target_audience' => 'nullable|array',
            'target_audience.*' => 'string|max:500',
            'features_required' => 'nullable|array',
            'features_required.*' => 'string|max:500',
            'features_nice_to_have' => 'nullable|array',
            'features_nice_to_have.*' => 'string|max:500',
            'budget_range' => 'nullable|string|in:under_5k,5k_10k,10k_25k,25k_50k,50k_plus',
            'timeline' => 'nullable|string|in:asap,1_month,3_months,6_months,flexible',
            'preferred_start_date' => 'nullable|date|after:today',
            'required_completion_date' => 'nullable|date|after:preferred_start_date',
            'has_existing_system' => 'boolean',
            'existing_system_details' => 'nullable|string|max:2000',
            'requires_maintenance' => 'boolean',
            'requires_hosting' => 'boolean',
            'requires_training' => 'boolean',
            'technology_preferences' => 'nullable|array',
            'technology_preferences.*' => 'string|max:100',
            'design_preferences' => 'nullable|array',
            'design_preferences.*' => 'string|max:500',
            'reference_websites' => 'nullable|array',
            'reference_websites.*' => 'url|max:500',
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
            $inquiry = GuestProjectInquiry::create($data);

            // Send notification to staff
            $this->notifyStaff($inquiry);

            return response()->json([
                'success' => true,
                'message' => 'Your project inquiry has been submitted successfully. Our team will review your requirements and get back to you with a detailed proposal.',
                'reference_number' => $inquiry->reference_number
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while submitting your project inquiry. Please try again.'
            ], 500);
        }
    }

    /**
     * Show project inquiry status by reference number.
     */
    public function status(Request $request): Response|JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reference_number' => 'required|string|exists:guest_project_inquiries,reference_number'
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return Inertia::render('Guest/Project/Status', [
                'error' => 'Invalid reference number.'
            ]);
        }

        $inquiry = GuestProjectInquiry::where('reference_number', $request->reference_number)
            ->with(['assignedTo:id,name', 'project:id,name,status'])
            ->first();

        $inquiryData = [
            'reference_number' => $inquiry->reference_number,
            'project_type' => $inquiry->project_type,
            'project_title' => $inquiry->project_title,
            'status' => $inquiry->status,
            'priority' => $inquiry->priority,
            'created_at' => $inquiry->created_at,
            'proposal_sent_at' => $inquiry->proposal_sent_at,
            'assigned_to' => $inquiry->assignedTo?->name,
            'project' => $inquiry->project,
            'estimated_complexity' => $inquiry->estimated_complexity,
            'formatted_budget_range' => $inquiry->formatted_budget_range,
            'formatted_timeline' => $inquiry->formatted_timeline,
        ];

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'inquiry' => $inquiryData
            ]);
        }

        return Inertia::render('Guest/Project/Status', [
            'inquiry' => $inquiryData
        ]);
    }

    /**
     * Show the status check form.
     */
    public function statusForm(): Response
    {
        return Inertia::render('Guest/Project/StatusCheck');
    }

    /**
     * Notify staff about new project inquiry.
     */
    private function notifyStaff(GuestProjectInquiry $inquiry): void
    {
        try {
            $notificationService = app(NotificationService::class);
            
            // Get project managers and admins
            $users = \App\Models\User::whereHas('roles', function($q) {
                $q->whereIn('name', ['admin', 'manager']);
            })->orWhereHas('permissions', function($q) {
                $q->whereIn('name', ['manage projects', 'view projects']);
            })->get();
            
            foreach ($users as $user) {
                $notificationService->send(
                    $user,
                    'New Project Inquiry',
                    "New {$inquiry->project_type} project inquiry from {$inquiry->name} - {$inquiry->project_title}",
                    [
                        'type' => 'guest_project_inquiry',
                        'inquiry_id' => $inquiry->id,
                        'reference_number' => $inquiry->reference_number,
                        'priority' => $inquiry->priority,
                        'project_type' => $inquiry->project_type,
                        'budget_range' => $inquiry->budget_range,
                        'estimated_complexity' => $inquiry->estimated_complexity
                    ]
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send project inquiry notification: ' . $e->getMessage());
        }
    }
}
