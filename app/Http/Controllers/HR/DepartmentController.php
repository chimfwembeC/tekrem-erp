<?php

namespace App\Http\Controllers\HR;

use App\Http\Controllers\Controller;
use App\Models\HR\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index(Request $request): Response
    {
        $query = Department::with(['manager', 'parentDepartment', 'employees'])
            ->withCount(['employees' => function ($query) {
                $query->where('employment_status', 'active');
            }])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
            })
            ->when($request->is_active !== null, function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->parent_id, function ($query, $parentId) {
                if ($parentId === 'root') {
                    $query->whereNull('parent_department_id');
                } else {
                    $query->where('parent_department_id', $parentId);
                }
            });

        $departments = $query->orderBy('name')->paginate(15)->withQueryString();

        $parentDepartments = Department::active()
            ->whereNull('parent_department_id')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('HR/Departments/Index', [
            'departments' => $departments,
            'parentDepartments' => $parentDepartments,
            'filters' => $request->only(['search', 'is_active', 'parent_id']),
        ]);
    }

    /**
     * Show the form for creating a new department.
     */
    public function create(): Response
    {
        $managers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);

        $parentDepartments = Department::active()
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('HR/Departments/Create', [
            'managers' => $managers,
            'parentDepartments' => $parentDepartments,
        ]);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:hr_departments,code',
            'description' => 'nullable|string',
            'manager_id' => 'nullable|exists:users,id',
            'parent_department_id' => 'nullable|exists:hr_departments,id',
            'location' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);

        $department = Department::create($validated);

        return redirect()->route('hr.departments.show', $department)
            ->with('success', 'Department created successfully.');
    }

    /**
     * Display the specified department.
     */
    public function show(Department $department): Response
    {
        $department->load([
            'manager',
            'parentDepartment',
            'childDepartments.manager',
            'employees.user' => function ($query) {
                $query->where('employment_status', 'active');
            }
        ]);

        // Calculate department statistics
        $stats = [
            'total_employees' => $department->employees()->where('employment_status', 'active')->count(),
            'total_budget' => $department->total_budget,
            'child_departments' => $department->childDepartments()->count(),
            'average_salary' => $department->employees()
                ->where('employment_status', 'active')
                ->whereNotNull('salary')
                ->avg('salary'),
            'recent_hires' => $department->employees()
                ->where('hire_date', '>=', now()->subDays(30))
                ->count(),
        ];

        // Get organizational chart data
        $orgChart = $this->buildOrgChart($department);

        return Inertia::render('HR/Departments/Show', [
            'department' => $department,
            'stats' => $stats,
            'orgChart' => $orgChart,
        ]);
    }

    /**
     * Show the form for editing the department.
     */
    public function edit(Department $department): Response
    {
        $department->load(['manager', 'parentDepartment']);

        $managers = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['admin', 'staff']);
        })->orderBy('name')->get(['id', 'name']);

        $parentDepartments = Department::active()
            ->where('id', '!=', $department->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('HR/Departments/Edit', [
            'department' => $department,
            'managers' => $managers,
            'parentDepartments' => $parentDepartments,
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, Department $department): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:10',
                Rule::unique('hr_departments', 'code')->ignore($department->id),
            ],
            'description' => 'nullable|string',
            'manager_id' => 'nullable|exists:users,id',
            'parent_department_id' => [
                'nullable',
                'exists:hr_departments,id',
                Rule::notIn([$department->id]), // Prevent self-parenting
            ],
            'location' => 'nullable|string|max:255',
            'budget' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'metadata' => 'nullable|array',
        ]);

        // Prevent circular hierarchy
        if ($validated['parent_department_id']) {
            $descendants = $department->getAllDescendants()->pluck('id');
            if ($descendants->contains($validated['parent_department_id'])) {
                return back()->withErrors([
                    'parent_department_id' => 'Cannot set a child department as parent (circular reference).'
                ]);
            }
        }

        $department->update($validated);

        return redirect()->route('hr.departments.show', $department)
            ->with('success', 'Department updated successfully.');
    }

    /**
     * Remove the specified department.
     */
    public function destroy(Department $department): RedirectResponse
    {
        // Check if department has employees
        if ($department->employees()->where('employment_status', 'active')->exists()) {
            return back()->withErrors([
                'department' => 'Cannot delete department with active employees.'
            ]);
        }

        // Check if department has child departments
        if ($department->childDepartments()->exists()) {
            return back()->withErrors([
                'department' => 'Cannot delete department with child departments.'
            ]);
        }

        $department->delete();

        return redirect()->route('hr.departments.index')
            ->with('success', 'Department deleted successfully.');
    }

    /**
     * Activate a department.
     */
    public function activate(Department $department): RedirectResponse
    {
        $department->update(['is_active' => true]);

        return back()->with('success', 'Department activated successfully.');
    }

    /**
     * Deactivate a department.
     */
    public function deactivate(Department $department): RedirectResponse
    {
        // Check if department has active employees
        if ($department->employees()->where('employment_status', 'active')->exists()) {
            return back()->withErrors([
                'department' => 'Cannot deactivate department with active employees.'
            ]);
        }

        $department->update(['is_active' => false]);

        return back()->with('success', 'Department deactivated successfully.');
    }

    /**
     * Build organizational chart data for a department.
     */
    private function buildOrgChart(Department $department): array
    {
        $chart = [
            'id' => $department->id,
            'name' => $department->name,
            'manager' => $department->manager ? [
                'id' => $department->manager->id,
                'name' => $department->manager->name,
            ] : null,
            'employee_count' => $department->employees()->where('employment_status', 'active')->count(),
            'children' => [],
        ];

        foreach ($department->childDepartments as $child) {
            $chart['children'][] = $this->buildOrgChart($child);
        }

        return $chart;
    }
}
