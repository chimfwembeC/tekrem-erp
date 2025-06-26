<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guest\GuestInquiry;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuestInquiryController extends Controller
{
    /**
     * Display a listing of guest inquiries.
     */
    public function index(Request $request): Response
    {
        $query = GuestInquiry::with('assignedTo:id,name');

        // Apply filters
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('urgency')) {
            $query->where('urgency', $request->urgency);
        }

        if ($request->filled('assigned_to')) {
            if ($request->assigned_to === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $request->assigned_to);
            }
        }

        $inquiries = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // Get filter options
        $users = User::whereHas('roles', function($q) {
            $q->whereIn('name', ['admin', 'staff', 'manager']);
        })->select('id', 'name')->get();

        $stats = [
            'total' => GuestInquiry::count(),
            'new' => GuestInquiry::where('status', 'new')->count(),
            'in_progress' => GuestInquiry::where('status', 'in_progress')->count(),
            'unassigned' => GuestInquiry::whereNull('assigned_to')->count(),
        ];

        return Inertia::render('Admin/GuestInquiries/Index', [
            'inquiries' => $inquiries,
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'type', 'status', 'urgency', 'assigned_to']),
            'inquiryTypes' => [
                'general' => 'General Inquiry',
                'sales' => 'Sales Inquiry',
                'partnership' => 'Partnership Opportunity',
                'other' => 'Other'
            ],
            'statuses' => [
                'new' => 'New',
                'in_progress' => 'In Progress',
                'resolved' => 'Resolved',
                'closed' => 'Closed'
            ],
            'urgencyLevels' => [
                'low' => 'Low',
                'normal' => 'Normal',
                'high' => 'High',
                'urgent' => 'Urgent'
            ]
        ]);
    }

    /**
     * Display the specified guest inquiry.
     */
    public function show(GuestInquiry $guestInquiry): Response
    {
        $guestInquiry->load('assignedTo:id,name');

        return Inertia::render('Admin/GuestInquiries/Show', [
            'inquiry' => $guestInquiry
        ]);
    }

    /**
     * Update the specified guest inquiry.
     */
    public function update(Request $request, GuestInquiry $guestInquiry)
    {
        $request->validate([
            'status' => 'required|string|in:new,in_progress,resolved,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'internal_notes' => 'nullable|string|max:5000',
        ]);

        $data = $request->only(['status', 'assigned_to', 'internal_notes']);

        // Mark as responded if status changes to in_progress and not already responded
        if ($request->status === 'in_progress' && !$guestInquiry->responded_at) {
            $data['responded_at'] = now();
        }

        $guestInquiry->update($data);

        return redirect()->back()->with('success', 'Inquiry updated successfully.');
    }

    /**
     * Assign inquiry to a user.
     */
    public function assign(Request $request, GuestInquiry $guestInquiry)
    {
        $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->assigned_to);
        $guestInquiry->assignTo($user);

        return redirect()->back()->with('success', "Inquiry assigned to {$user->name} successfully.");
    }

    /**
     * Mark inquiry as responded.
     */
    public function markResponded(GuestInquiry $guestInquiry)
    {
        $guestInquiry->markAsResponded();

        return redirect()->back()->with('success', 'Inquiry marked as responded.');
    }

    /**
     * Bulk update inquiries.
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'inquiry_ids' => 'required|array',
            'inquiry_ids.*' => 'exists:guest_inquiries,id',
            'action' => 'required|string|in:assign,status,delete',
            'assigned_to' => 'required_if:action,assign|nullable|exists:users,id',
            'status' => 'required_if:action,status|nullable|string|in:new,in_progress,resolved,closed',
        ]);

        $inquiries = GuestInquiry::whereIn('id', $request->inquiry_ids);

        switch ($request->action) {
            case 'assign':
                $user = User::findOrFail($request->assigned_to);
                $inquiries->update([
                    'assigned_to' => $user->id,
                    'status' => 'in_progress'
                ]);
                $message = "Inquiries assigned to {$user->name} successfully.";
                break;

            case 'status':
                $updateData = ['status' => $request->status];
                if ($request->status === 'in_progress') {
                    $updateData['responded_at'] = now();
                }
                $inquiries->update($updateData);
                $message = "Inquiries status updated to {$request->status} successfully.";
                break;

            case 'delete':
                $inquiries->delete();
                $message = 'Selected inquiries deleted successfully.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Remove the specified guest inquiry.
     */
    public function destroy(GuestInquiry $guestInquiry)
    {
        $guestInquiry->delete();

        return redirect()->route('admin.guest-inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }

    /**
     * Export inquiries to CSV.
     */
    public function export(Request $request)
    {
        $query = GuestInquiry::with('assignedTo:id,name');

        // Apply same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('subject', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $inquiries = $query->orderBy('created_at', 'desc')->get();

        $filename = 'guest_inquiries_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($inquiries) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'Reference Number',
                'Type',
                'Name',
                'Email',
                'Phone',
                'Company',
                'Position',
                'Subject',
                'Message',
                'Urgency',
                'Status',
                'Assigned To',
                'Source',
                'Created At',
                'Responded At'
            ]);

            // CSV data
            foreach ($inquiries as $inquiry) {
                fputcsv($file, [
                    $inquiry->reference_number,
                    $inquiry->type,
                    $inquiry->name,
                    $inquiry->email,
                    $inquiry->phone,
                    $inquiry->company,
                    $inquiry->position,
                    $inquiry->subject,
                    $inquiry->message,
                    $inquiry->urgency,
                    $inquiry->status,
                    $inquiry->assignedTo?->name,
                    $inquiry->source,
                    $inquiry->created_at->format('Y-m-d H:i:s'),
                    $inquiry->responded_at?->format('Y-m-d H:i:s')
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
