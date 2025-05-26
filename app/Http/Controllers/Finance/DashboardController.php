<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\Account;
use App\Models\Finance\Budget;
use App\Models\Finance\Expense;
use App\Models\Finance\Invoice;
use App\Models\Finance\Payment;
use App\Models\Finance\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get financial overview data
        $totalBalance = Account::where('user_id', $user->id)
            ->where('is_active', true)
            ->sum('balance');

        $monthlyIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->where('status', 'completed')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        $monthlyExpenses = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->where('status', 'completed')
            ->whereMonth('transaction_date', now()->month)
            ->whereYear('transaction_date', now()->year)
            ->sum('amount');

        $pendingInvoices = Invoice::where('user_id', $user->id)
            ->whereIn('status', ['sent', 'partial'])
            ->count();

        $overdueInvoices = Invoice::where('user_id', $user->id)
            ->where('due_date', '<', now())
            ->whereIn('status', ['sent', 'partial'])
            ->count();

        $totalInvoiceAmount = Invoice::where('user_id', $user->id)
            ->whereIn('status', ['sent', 'partial'])
            ->sum('total_amount');

        $recentTransactions = Transaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->limit(10)
            ->get();

        $recentInvoices = Invoice::where('user_id', $user->id)
            ->with('billable')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $budgetAlerts = Budget::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('alert_enabled', true)
            ->get()
            ->filter(function ($budget) {
                $budget->updateSpentAmount();
                return $budget->is_over_threshold;
            });

        // Monthly income vs expenses chart data
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $income = Transaction::where('user_id', $user->id)
                ->where('type', 'income')
                ->where('status', 'completed')
                ->whereMonth('transaction_date', $date->month)
                ->whereYear('transaction_date', $date->year)
                ->sum('amount');

            $expenses = Transaction::where('user_id', $user->id)
                ->where('type', 'expense')
                ->where('status', 'completed')
                ->whereMonth('transaction_date', $date->month)
                ->whereYear('transaction_date', $date->year)
                ->sum('amount');

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
            ];
        }

        return Inertia::render('Finance/Dashboard', [
            'stats' => [
                'totalBalance' => (float) $totalBalance,
                'monthlyIncome' => (float) $monthlyIncome,
                'monthlyExpenses' => (float) $monthlyExpenses,
                'netIncome' => (float) ($monthlyIncome - $monthlyExpenses),
                'pendingInvoices' => $pendingInvoices,
                'overdueInvoices' => $overdueInvoices,
                'totalInvoiceAmount' => (float) $totalInvoiceAmount,
            ],
            'recentTransactions' => $recentTransactions,
            'recentInvoices' => $recentInvoices,
            'budgetAlerts' => $budgetAlerts,
            'monthlyData' => $monthlyData,
        ]);
    }
}
