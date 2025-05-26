<?php

namespace App\Models\Approval;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'type',
        'description',
        'conditions',
        'steps',
        'is_active',
        'created_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'conditions' => 'array',
        'steps' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the user who created the workflow.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the approval requests for this workflow.
     */
    public function requests(): HasMany
    {
        return $this->hasMany(ApprovalRequest::class, 'workflow_id');
    }

    /**
     * Scope a query to only include active workflows.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include workflows of a specific type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Check if this workflow should be triggered for the given item.
     */
    public function shouldTrigger($item)
    {
        if (!$this->is_active) {
            return false;
        }

        $conditions = $this->conditions;

        // Check amount threshold
        if (isset($conditions['min_amount']) && $item->total_amount < $conditions['min_amount']) {
            return false;
        }

        if (isset($conditions['max_amount']) && $item->total_amount > $conditions['max_amount']) {
            return false;
        }

        // Check currency
        if (isset($conditions['currencies']) && !in_array($item->currency, $conditions['currencies'])) {
            return false;
        }

        // Check user role
        if (isset($conditions['user_roles'])) {
            $userRole = $item->user->role ?? null;
            if ($userRole && !in_array($userRole, $conditions['user_roles'])) {
                return false;
            }
        }

        // Check department
        if (isset($conditions['departments'])) {
            $userDepartment = $item->user->department ?? null;
            if ($userDepartment && !in_array($userDepartment, $conditions['departments'])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Create an approval request for the given item.
     */
    public function createRequest($item, $requestedBy = null)
    {
        $requestedBy = $requestedBy ?: auth()->id();

        $request = ApprovalRequest::create([
            'workflow_id' => $this->id,
            'approvable_type' => get_class($item),
            'approvable_id' => $item->id,
            'status' => 'pending',
            'requested_by' => $requestedBy,
            'requested_at' => now(),
        ]);

        // Create approval steps
        foreach ($this->steps as $index => $stepConfig) {
            $request->steps()->create([
                'step_number' => $index + 1,
                'step_name' => $stepConfig['name'],
                'approver_id' => $stepConfig['approver_id'] ?? null,
                'step_data' => $stepConfig,
                'assigned_at' => $index === 0 ? now() : null, // Only assign first step immediately
            ]);
        }

        return $request;
    }

    /**
     * Get workflow statistics.
     */
    public function getStatistics($period = '30_days')
    {
        $dateRange = $this->getDateRange($period);

        $requests = $this->requests()
            ->whereBetween('requested_at', $dateRange);

        $total = $requests->count();
        $approved = $requests->where('status', 'approved')->count();
        $rejected = $requests->where('status', 'rejected')->count();
        $pending = $requests->where('status', 'pending')->count();

        $avgProcessingTime = $this->getAverageProcessingTime($dateRange);

        return [
            'total_requests' => $total,
            'approved' => $approved,
            'rejected' => $rejected,
            'pending' => $pending,
            'approval_rate' => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
            'avg_processing_time' => $avgProcessingTime,
        ];
    }

    /**
     * Get average processing time in hours.
     */
    private function getAverageProcessingTime($dateRange)
    {
        $completedRequests = $this->requests()
            ->whereBetween('requested_at', $dateRange)
            ->whereIn('status', ['approved', 'rejected'])
            ->whereNotNull('completed_at')
            ->get();

        if ($completedRequests->isEmpty()) {
            return 0;
        }

        $totalHours = $completedRequests->sum(function ($request) {
            return $request->requested_at->diffInHours($request->completed_at);
        });

        return round($totalHours / $completedRequests->count(), 1);
    }

    /**
     * Get date range for period.
     */
    private function getDateRange($period)
    {
        switch ($period) {
            case '7_days':
                return [now()->subDays(7), now()];
            case '30_days':
                return [now()->subDays(30), now()];
            case '90_days':
                return [now()->subDays(90), now()];
            default:
                return [now()->subDays(30), now()];
        }
    }

    /**
     * Find the appropriate workflow for an item.
     */
    public static function findWorkflowForItem($item)
    {
        $itemType = strtolower(class_basename($item));

        return static::active()
            ->ofType($itemType)
            ->get()
            ->first(function ($workflow) use ($item) {
                return $workflow->shouldTrigger($item);
            });
    }
}
