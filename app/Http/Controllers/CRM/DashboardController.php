<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Communication;
use App\Models\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the CRM dashboard.
     */
    public function index()
    {
        $totalClients = Client::count();
        $totalLeads = Lead::count();
        $recentClients = Client::latest()->take(5)->get();
        $recentLeads = Lead::latest()->take(5)->get();
        $recentCommunications = Communication::with('communicable', 'user')
            ->latest()
            ->take(10)
            ->get();

        $leadsByStatus = Lead::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        $clientsByStatus = Client::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->get();

        return Inertia::render('CRM/Dashboard', [
            'stats' => [
                'totalClients' => $totalClients,
                'totalLeads' => $totalLeads,
                'leadsByStatus' => $leadsByStatus,
                'clientsByStatus' => $clientsByStatus,
            ],
            'recentClients' => $recentClients,
            'recentLeads' => $recentLeads,
            'recentCommunications' => $recentCommunications,
        ]);
    }
}
