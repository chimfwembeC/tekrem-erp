<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Handle dashboard routing based on user role.
     */
    public function index(): Response|RedirectResponse
    {
        $user = Auth::user();

        // Redirect customers to their dedicated dashboard
        if ($user->hasRole('customer')) {
            return redirect()->route('customer.dashboard');
        }

        // For admin, manager, and staff users, show the main dashboard
        return Inertia::render('Dashboard');
    }
}
