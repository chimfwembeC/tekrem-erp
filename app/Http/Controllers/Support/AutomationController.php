<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Support\AutomationRule;
use App\Models\Support\Ticket;
use App\Services\Support\AutomationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AutomationController extends Controller
{
    public function __construct(
        private AutomationService $automationService
    ) {}

    /**
     * Display automation rules.
     */
    public function index(Request $request): Response
    {
        $rules = AutomationRule::with(['createdBy', 'updatedBy'])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->trigger, function ($query, $trigger) {
                $query->where('trigger_event', $trigger);
            })
            ->when($request->active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('active'));
            })
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Support/Automation/Index', [
            'rules' => $rules,
            'availableTriggers' => $this->automationService->getAvailableTriggers(),
            'filters' => $request->only(['search', 'trigger', 'active']),
        ]);
    }

    /**
     * Show the form for creating a new automation rule.
     */
    public function create(): Response
    {
        return Inertia::render('Support/Automation/Create', [
            'availableTriggers' => $this->automationService->getAvailableTriggers(),
            'availableConditionFields' => $this->automationService->getAvailableConditionFields(),
            'availableOperators' => $this->automationService->getAvailableOperators(),
            'availableActions' => $this->automationService->getAvailableActions(),
        ]);
    }

    /**
     * Store a newly created automation rule.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'trigger_event' => ['required', 'string'],
            'conditions' => ['nullable', 'array'],
            'conditions.*.field' => ['required', 'string'],
            'conditions.*.operator' => ['required', 'string'],
            'conditions.*.value' => ['nullable'],
            'actions' => ['required', 'array', 'min:1'],
            'actions.*.type' => ['required', 'string'],
            'actions.*.params' => ['nullable', 'array'],
            'priority' => ['integer', 'min:0', 'max:100'],
        ]);

        // Validate rule configuration
        $errors = $this->automationService->validateRule($validated);
        if (!empty($errors)) {
            return redirect()->back()->withErrors($errors)->withInput();
        }

        $rule = $this->automationService->createRule($validated);

        return redirect()->route('support.automation.show', $rule)
            ->with('success', 'Automation rule created successfully.');
    }

    /**
     * Display the specified automation rule.
     */
    public function show(AutomationRule $automation): Response
    {
        $automation->load(['createdBy', 'updatedBy']);
        
        $statistics = $this->automationService->getRuleStatistics($automation);

        return Inertia::render('Support/Automation/Show', [
            'rule' => $automation,
            'statistics' => $statistics,
            'availableTriggers' => $this->automationService->getAvailableTriggers(),
            'availableConditionFields' => $this->automationService->getAvailableConditionFields(),
            'availableOperators' => $this->automationService->getAvailableOperators(),
            'availableActions' => $this->automationService->getAvailableActions(),
        ]);
    }

    /**
     * Show the form for editing the specified automation rule.
     */
    public function edit(AutomationRule $automation): Response
    {
        return Inertia::render('Support/Automation/Edit', [
            'rule' => $automation,
            'availableTriggers' => $this->automationService->getAvailableTriggers(),
            'availableConditionFields' => $this->automationService->getAvailableConditionFields(),
            'availableOperators' => $this->automationService->getAvailableOperators(),
            'availableActions' => $this->automationService->getAvailableActions(),
        ]);
    }

    /**
     * Update the specified automation rule.
     */
    public function update(Request $request, AutomationRule $automation): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'trigger_event' => ['required', 'string'],
            'conditions' => ['nullable', 'array'],
            'conditions.*.field' => ['required', 'string'],
            'conditions.*.operator' => ['required', 'string'],
            'conditions.*.value' => ['nullable'],
            'actions' => ['required', 'array', 'min:1'],
            'actions.*.type' => ['required', 'string'],
            'actions.*.params' => ['nullable', 'array'],
            'priority' => ['integer', 'min:0', 'max:100'],
        ]);

        // Validate rule configuration
        $errors = $this->automationService->validateRule($validated);
        if (!empty($errors)) {
            return redirect()->back()->withErrors($errors)->withInput();
        }

        $this->automationService->updateRule($automation, $validated);

        return redirect()->route('support.automation.show', $automation)
            ->with('success', 'Automation rule updated successfully.');
    }

    /**
     * Remove the specified automation rule.
     */
    public function destroy(AutomationRule $automation): RedirectResponse
    {
        $automation->delete();

        return redirect()->route('support.automation.index')
            ->with('success', 'Automation rule deleted successfully.');
    }

    /**
     * Toggle automation rule active status.
     */
    public function toggle(AutomationRule $automation): JsonResponse
    {
        $automation->update(['is_active' => !$automation->is_active]);

        return response()->json([
            'success' => true,
            'is_active' => $automation->is_active,
            'message' => $automation->is_active ? 'Rule activated' : 'Rule deactivated',
        ]);
    }

    /**
     * Test automation rule against a ticket.
     */
    public function test(Request $request, AutomationRule $automation): JsonResponse
    {
        $validated = $request->validate([
            'ticket_id' => ['required', 'exists:tickets,id'],
        ]);

        $ticket = Ticket::with(['category', 'assignedTo'])->find($validated['ticket_id']);
        $result = $this->automationService->testRule($automation, $ticket);

        return response()->json($result);
    }

    /**
     * Duplicate automation rule.
     */
    public function duplicate(AutomationRule $automation): RedirectResponse
    {
        $newRule = $this->automationService->createRule([
            'name' => $automation->name . ' (Copy)',
            'description' => $automation->description,
            'is_active' => false, // Start as inactive
            'trigger_event' => $automation->trigger_event,
            'conditions' => $automation->conditions,
            'actions' => $automation->actions,
            'priority' => $automation->priority,
        ]);

        return redirect()->route('support.automation.edit', $newRule)
            ->with('success', 'Automation rule duplicated successfully.');
    }

    /**
     * Get automation rule execution logs.
     */
    public function logs(AutomationRule $automation): JsonResponse
    {
        // This would return execution logs from a logging system
        // For now, return mock data
        return response()->json([
            'logs' => [],
            'total' => 0,
        ]);
    }

    /**
     * Export automation rules.
     */
    public function export(): JsonResponse
    {
        $rules = AutomationRule::all();
        
        $export = $rules->map(function ($rule) {
            return [
                'name' => $rule->name,
                'description' => $rule->description,
                'trigger_event' => $rule->trigger_event,
                'conditions' => $rule->conditions,
                'actions' => $rule->actions,
                'priority' => $rule->priority,
                'is_active' => $rule->is_active,
            ];
        });

        return response()->json($export);
    }

    /**
     * Import automation rules.
     */
    public function import(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rules' => ['required', 'array'],
            'rules.*.name' => ['required', 'string'],
            'rules.*.trigger_event' => ['required', 'string'],
            'rules.*.actions' => ['required', 'array'],
        ]);

        $imported = 0;
        foreach ($validated['rules'] as $ruleData) {
            try {
                $this->automationService->createRule($ruleData);
                $imported++;
            } catch (\Exception $e) {
                // Log error but continue with other rules
                \Log::error('Failed to import automation rule', [
                    'rule' => $ruleData,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return redirect()->route('support.automation.index')
            ->with('success', "Successfully imported {$imported} automation rules.");
    }
}
