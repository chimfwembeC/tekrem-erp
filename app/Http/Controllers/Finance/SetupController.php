<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SetupController extends Controller
{
    /**
     * Display the Finance module setup page.
     */
    public function index(): Response
    {
        $this->authorize('manage-finance-settings');

        return Inertia::render('Finance/Setup/Index', [
            'generalSettings' => $this->getGeneralSettings(),
            'invoiceSettings' => $this->getInvoiceSettings(),
            'paymentSettings' => $this->getPaymentSettings(),
            'taxSettings' => $this->getTaxSettings(),
            'budgetSettings' => $this->getBudgetSettings(),
            'reportingSettings' => $this->getReportingSettings(),
        ]);
    }

    /**
     * Update general finance settings.
     */
    public function updateGeneral(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'default_currency' => 'required|string|max:3',
            'currency_symbol' => 'required|string|max:5',
            'decimal_places' => 'required|integer|min:0|max:4',
            'thousand_separator' => 'required|string|max:1',
            'decimal_separator' => 'required|string|max:1',
            'fiscal_year_start' => 'required|string',
            'enable_multi_currency' => 'boolean',
            'auto_currency_conversion' => 'boolean',
            'enable_financial_analytics' => 'boolean',
            'enable_budget_tracking' => 'boolean',
            'enable_expense_approval' => 'boolean',
            'enable_ai_categorization' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.general.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'General finance settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update invoice settings.
     */
    public function updateInvoice(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'invoice_number_format' => 'required|string|max:50',
            'invoice_prefix' => 'nullable|string|max:10',
            'auto_generate_numbers' => 'boolean',
            'default_payment_terms' => 'required|string|max:100',
            'default_due_days' => 'required|integer|min:1|max:365',
            'late_fee_enabled' => 'boolean',
            'late_fee_percentage' => 'nullable|numeric|min:0|max:100',
            'late_fee_amount' => 'nullable|numeric|min:0',
            'auto_send_invoices' => 'boolean',
            'auto_send_reminders' => 'boolean',
            'reminder_days_before' => 'nullable|integer|min:1|max:90',
            'reminder_days_after' => 'nullable|integer|min:1|max:90',
            'enable_online_payments' => 'boolean',
            'enable_partial_payments' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.invoice.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Invoice settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update payment settings.
     */
    public function updatePayment(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_stripe' => 'boolean',
            'enable_paypal' => 'boolean',
            'enable_bank_transfer' => 'boolean',
            'enable_cash_payments' => 'boolean',
            'enable_check_payments' => 'boolean',
            'auto_reconcile_payments' => 'boolean',
            'payment_confirmation_required' => 'boolean',
            'enable_payment_analytics' => 'boolean',
            'default_payment_method' => 'required|string|max:50',
            'payment_processing_fee' => 'nullable|numeric|min:0|max:100',
            'minimum_payment_amount' => 'nullable|numeric|min:0',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.payment.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Payment settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update tax settings.
     */
    public function updateTax(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_tax_calculation' => 'boolean',
            'default_tax_rate' => 'required|numeric|min:0|max:100',
            'tax_inclusive_pricing' => 'boolean',
            'enable_multiple_tax_rates' => 'boolean',
            'enable_tax_exemptions' => 'boolean',
            'auto_calculate_tax' => 'boolean',
            'tax_rounding_method' => 'required|in:round,floor,ceil',
            'enable_tax_reporting' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.tax.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Tax settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update budget settings.
     */
    public function updateBudget(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_budget_management' => 'boolean',
            'budget_period' => 'required|in:monthly,quarterly,annually',
            'enable_budget_alerts' => 'boolean',
            'budget_alert_threshold' => 'nullable|integer|min:1|max:100',
            'enable_budget_approval' => 'boolean',
            'auto_create_budgets' => 'boolean',
            'enable_budget_forecasting' => 'boolean',
            'enable_variance_analysis' => 'boolean',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.budget.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Budget settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Update reporting settings.
     */
    public function updateReporting(Request $request)
    {
        $this->authorize('manage-finance-settings');

        $validated = $request->validate([
            'enable_financial_reports' => 'boolean',
            'auto_generate_reports' => 'boolean',
            'report_frequency' => 'required|in:daily,weekly,monthly,quarterly',
            'enable_profit_loss' => 'boolean',
            'enable_balance_sheet' => 'boolean',
            'enable_cash_flow' => 'boolean',
            'enable_expense_reports' => 'boolean',
            'enable_revenue_reports' => 'boolean',
            'enable_tax_reports' => 'boolean',
            'report_retention_months' => 'required|integer|min:1|max:120',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set("finance.reporting.{$key}", $value);
        }

        session()->flash('flash', [
            'bannerStyle' => 'success',
            'banner' => 'Reporting settings updated successfully!'
        ]);

        return redirect()->back();
    }

    /**
     * Get general settings.
     */
    private function getGeneralSettings(): array
    {
        return [
            'default_currency' => Setting::get('finance.general.default_currency', 'USD'),
            'currency_symbol' => Setting::get('finance.general.currency_symbol', '$'),
            'decimal_places' => Setting::get('finance.general.decimal_places', 2),
            'thousand_separator' => Setting::get('finance.general.thousand_separator', ','),
            'decimal_separator' => Setting::get('finance.general.decimal_separator', '.'),
            'fiscal_year_start' => Setting::get('finance.general.fiscal_year_start', '01-01'),
            'enable_multi_currency' => Setting::get('finance.general.enable_multi_currency', false),
            'auto_currency_conversion' => Setting::get('finance.general.auto_currency_conversion', false),
            'enable_financial_analytics' => Setting::get('finance.general.enable_financial_analytics', true),
            'enable_budget_tracking' => Setting::get('finance.general.enable_budget_tracking', true),
            'enable_expense_approval' => Setting::get('finance.general.enable_expense_approval', true),
            'enable_ai_categorization' => Setting::get('finance.general.enable_ai_categorization', true),
        ];
    }

    /**
     * Get invoice settings.
     */
    private function getInvoiceSettings(): array
    {
        return [
            'invoice_number_format' => Setting::get('finance.invoice.invoice_number_format', 'INV-{YYYY}-{####}'),
            'invoice_prefix' => Setting::get('finance.invoice.invoice_prefix', 'INV'),
            'auto_generate_numbers' => Setting::get('finance.invoice.auto_generate_numbers', true),
            'default_payment_terms' => Setting::get('finance.invoice.default_payment_terms', 'Net 30'),
            'default_due_days' => Setting::get('finance.invoice.default_due_days', 30),
            'late_fee_enabled' => Setting::get('finance.invoice.late_fee_enabled', false),
            'late_fee_percentage' => Setting::get('finance.invoice.late_fee_percentage', 5),
            'late_fee_amount' => Setting::get('finance.invoice.late_fee_amount', 0),
            'auto_send_invoices' => Setting::get('finance.invoice.auto_send_invoices', false),
            'auto_send_reminders' => Setting::get('finance.invoice.auto_send_reminders', true),
            'reminder_days_before' => Setting::get('finance.invoice.reminder_days_before', 3),
            'reminder_days_after' => Setting::get('finance.invoice.reminder_days_after', 7),
            'enable_online_payments' => Setting::get('finance.invoice.enable_online_payments', true),
            'enable_partial_payments' => Setting::get('finance.invoice.enable_partial_payments', true),
        ];
    }

    /**
     * Get payment settings.
     */
    private function getPaymentSettings(): array
    {
        return [
            'enable_stripe' => Setting::get('finance.payment.enable_stripe', false),
            'enable_paypal' => Setting::get('finance.payment.enable_paypal', false),
            'enable_bank_transfer' => Setting::get('finance.payment.enable_bank_transfer', true),
            'enable_cash_payments' => Setting::get('finance.payment.enable_cash_payments', true),
            'enable_check_payments' => Setting::get('finance.payment.enable_check_payments', true),
            'auto_reconcile_payments' => Setting::get('finance.payment.auto_reconcile_payments', false),
            'payment_confirmation_required' => Setting::get('finance.payment.payment_confirmation_required', true),
            'enable_payment_analytics' => Setting::get('finance.payment.enable_payment_analytics', true),
            'default_payment_method' => Setting::get('finance.payment.default_payment_method', 'bank_transfer'),
            'payment_processing_fee' => Setting::get('finance.payment.payment_processing_fee', 0),
            'minimum_payment_amount' => Setting::get('finance.payment.minimum_payment_amount', 1),
        ];
    }

    /**
     * Get tax settings.
     */
    private function getTaxSettings(): array
    {
        return [
            'enable_tax_calculation' => Setting::get('finance.tax.enable_tax_calculation', true),
            'default_tax_rate' => Setting::get('finance.tax.default_tax_rate', 10),
            'tax_inclusive_pricing' => Setting::get('finance.tax.tax_inclusive_pricing', false),
            'enable_multiple_tax_rates' => Setting::get('finance.tax.enable_multiple_tax_rates', false),
            'enable_tax_exemptions' => Setting::get('finance.tax.enable_tax_exemptions', true),
            'auto_calculate_tax' => Setting::get('finance.tax.auto_calculate_tax', true),
            'tax_rounding_method' => Setting::get('finance.tax.tax_rounding_method', 'round'),
            'enable_tax_reporting' => Setting::get('finance.tax.enable_tax_reporting', true),
        ];
    }

    /**
     * Get budget settings.
     */
    private function getBudgetSettings(): array
    {
        return [
            'enable_budget_management' => Setting::get('finance.budget.enable_budget_management', true),
            'budget_period' => Setting::get('finance.budget.budget_period', 'monthly'),
            'enable_budget_alerts' => Setting::get('finance.budget.enable_budget_alerts', true),
            'budget_alert_threshold' => Setting::get('finance.budget.budget_alert_threshold', 80),
            'enable_budget_approval' => Setting::get('finance.budget.enable_budget_approval', true),
            'auto_create_budgets' => Setting::get('finance.budget.auto_create_budgets', false),
            'enable_budget_forecasting' => Setting::get('finance.budget.enable_budget_forecasting', true),
            'enable_variance_analysis' => Setting::get('finance.budget.enable_variance_analysis', true),
        ];
    }

    /**
     * Get reporting settings.
     */
    private function getReportingSettings(): array
    {
        return [
            'enable_financial_reports' => Setting::get('finance.reporting.enable_financial_reports', true),
            'auto_generate_reports' => Setting::get('finance.reporting.auto_generate_reports', false),
            'report_frequency' => Setting::get('finance.reporting.report_frequency', 'monthly'),
            'enable_profit_loss' => Setting::get('finance.reporting.enable_profit_loss', true),
            'enable_balance_sheet' => Setting::get('finance.reporting.enable_balance_sheet', true),
            'enable_cash_flow' => Setting::get('finance.reporting.enable_cash_flow', true),
            'enable_expense_reports' => Setting::get('finance.reporting.enable_expense_reports', true),
            'enable_revenue_reports' => Setting::get('finance.reporting.enable_revenue_reports', true),
            'enable_tax_reports' => Setting::get('finance.reporting.enable_tax_reports', true),
            'report_retention_months' => Setting::get('finance.reporting.report_retention_months', 24),
        ];
    }
}
