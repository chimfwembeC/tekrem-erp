<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use App\Models\Support\Ticket;
use App\Models\Project;
use App\Models\Finance\Invoice;
use App\Models\Client;

use App\Models\Finance\Payment;

class DashboardController extends Controller
{
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'verified', 'customer']);
    // }

    /**
     * Display the customer dashboard.
     */
    public function index(): Response
    {
        $user = Auth::user();

        // Get customer's tickets
        $tickets = Ticket::where('requester_type', get_class($user))
            ->where('requester_id', $user->id)
            ->with(['category', 'assignedTo'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get customer's projects (if they have any)
        $projects = Project::whereJsonContains('team_members', $user->id)
            ->orWhere('client_id', function ($query) use ($user) {
                $query->select('id')
                    ->from('clients')
                    ->where('email', $user->email)
                    ->limit(1);
            })
            ->with(['client', 'manager'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Get customer's invoices
        $invoices = Invoice::whereHasMorph(
            'billable',
            [Client::class],
            function ($query) use ($user) {
                $query->where('email', $user->email);
            }
        )
        ->with('billable')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

        // Get customer's payments
       
        $payments = Payment::whereHas('invoice.billable', function ($query) use ($user) {
            $query->where('email', $user->email);
        }, '>=', 1, 'and', Client::class)
        ->with(['invoice.billable'])
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

        // Calculate statistics
        $stats = [
            'tickets' => [
                'total' => Ticket::where('requester_type', get_class($user))
                    ->where('requester_id', $user->id)
                    ->count(),
                'open' => Ticket::where('requester_type', get_class($user))
                    ->where('requester_id', $user->id)
                    ->where('status', 'open')
                    ->count(),
                'in_progress' => Ticket::where('requester_type', get_class($user))
                    ->where('requester_id', $user->id)
                    ->where('status', 'in_progress')
                    ->count(),
                'resolved' => Ticket::where('requester_type', get_class($user))
                    ->where('requester_id', $user->id)
                    ->whereIn('status', ['resolved', 'closed'])
                    ->count(),
            ],
            'projects' => [
                'total' => $projects->count(),
                'active' => $projects->where('status', 'active')->count(),
                'completed' => $projects->where('status', 'completed')->count(),
            ],
            'invoices' => [
                'total' => $invoices->count(),
                'paid' => $invoices->where('status', 'paid')->count(),
                'pending' => $invoices->where('status', 'pending')->count(),
                'overdue' => $invoices->where('status', 'overdue')->count(),
            ],
        ];

        return Inertia::render('Customer/Dashboard', [
            'tickets' => $tickets,
            'projects' => $projects,
            'invoices' => $invoices,
            'payments' => $payments,
            'stats' => $stats,
        ]);
    }
}
