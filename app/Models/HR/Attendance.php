<?php

namespace App\Models\HR;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'hr_attendances';

    protected $fillable = [
        'employee_id',
        'date',
        'clock_in',
        'clock_out',
        'break_start',
        'break_end',
        'total_hours',
        'break_duration',
        'overtime_hours',
        'status',
        'notes',
        'location',
        'ip_address',
        'is_manual_entry',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'date' => 'date',
        'clock_in' => 'datetime:H:i',
        'clock_out' => 'datetime:H:i',
        'break_start' => 'datetime:H:i',
        'break_end' => 'datetime:H:i',
        'is_manual_entry' => 'boolean',
        'approved_at' => 'datetime',
    ];

    /**
     * Get the employee for this attendance record.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * Get the user who approved this attendance.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Scope to get attendance for a specific date.
     */
    public function scopeForDate($query, $date)
    {
        return $query->where('date', $date);
    }

    /**
     * Scope to get attendance for a date range.
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    /**
     * Scope to get present attendance.
     */
    public function scopePresent($query)
    {
        return $query->where('status', 'present');
    }

    /**
     * Scope to get absent attendance.
     */
    public function scopeAbsent($query)
    {
        return $query->where('status', 'absent');
    }

    /**
     * Scope to get late attendance.
     */
    public function scopeLate($query)
    {
        return $query->where('status', 'late');
    }

    /**
     * Check if employee is currently clocked in.
     */
    public function isClockedIn(): bool
    {
        return $this->clock_in && !$this->clock_out;
    }

    /**
     * Check if employee is on break.
     */
    public function isOnBreak(): bool
    {
        return $this->break_start && !$this->break_end;
    }

    /**
     * Clock in the employee.
     */
    public function clockIn(string $location = null, string $ipAddress = null): bool
    {
        if ($this->clock_in) {
            return false; // Already clocked in
        }

        $this->update([
            'clock_in' => now(),
            'status' => 'present',
            'location' => $location,
            'ip_address' => $ipAddress,
        ]);

        return true;
    }

    /**
     * Clock out the employee.
     */
    public function clockOut(): bool
    {
        if (!$this->clock_in || $this->clock_out) {
            return false; // Not clocked in or already clocked out
        }

        $clockOut = now();
        $totalMinutes = $this->calculateTotalMinutes($this->clock_in, $clockOut);
        $breakMinutes = $this->calculateBreakMinutes();

        $this->update([
            'clock_out' => $clockOut,
            'total_hours' => $totalMinutes - $breakMinutes,
            'break_duration' => $breakMinutes,
            'overtime_hours' => $this->calculateOvertimeMinutes($totalMinutes - $breakMinutes),
        ]);

        return true;
    }

    /**
     * Start break.
     */
    public function startBreak(): bool
    {
        if (!$this->clock_in || $this->clock_out || $this->break_start) {
            return false;
        }

        $this->update(['break_start' => now()]);

        return true;
    }

    /**
     * End break.
     */
    public function endBreak(): bool
    {
        if (!$this->break_start || $this->break_end) {
            return false;
        }

        $this->update(['break_end' => now()]);

        return true;
    }

    /**
     * Calculate total minutes worked.
     */
    private function calculateTotalMinutes($clockIn, $clockOut): int
    {
        return Carbon::parse($clockIn)->diffInMinutes(Carbon::parse($clockOut));
    }

    /**
     * Calculate break minutes.
     */
    private function calculateBreakMinutes(): int
    {
        if (!$this->break_start || !$this->break_end) {
            return 0;
        }

        return Carbon::parse($this->break_start)->diffInMinutes(Carbon::parse($this->break_end));
    }

    /**
     * Calculate overtime minutes (assuming 8 hours = 480 minutes standard).
     */
    private function calculateOvertimeMinutes(int $totalMinutes): int
    {
        $standardMinutes = 480; // 8 hours
        return max(0, $totalMinutes - $standardMinutes);
    }

    /**
     * Get total hours in human readable format.
     */
    public function getTotalHoursFormattedAttribute(): string
    {
        if (!$this->total_hours) {
            return '0h 0m';
        }

        $hours = intval($this->total_hours / 60);
        $minutes = $this->total_hours % 60;

        return "{$hours}h {$minutes}m";
    }

    /**
     * Get break duration in human readable format.
     */
    public function getBreakDurationFormattedAttribute(): string
    {
        if (!$this->break_duration) {
            return '0h 0m';
        }

        $hours = intval($this->break_duration / 60);
        $minutes = $this->break_duration % 60;

        return "{$hours}h {$minutes}m";
    }

    /**
     * Get overtime hours in human readable format.
     */
    public function getOvertimeHoursFormattedAttribute(): string
    {
        if (!$this->overtime_hours) {
            return '0h 0m';
        }

        $hours = intval($this->overtime_hours / 60);
        $minutes = $this->overtime_hours % 60;

        return "{$hours}h {$minutes}m";
    }

    /**
     * Check if attendance is late (after 9:00 AM).
     */
    public function isLate(): bool
    {
        if (!$this->clock_in) {
            return false;
        }

        $standardStartTime = Carbon::parse($this->date->format('Y-m-d') . ' 09:00:00');
        return Carbon::parse($this->clock_in)->gt($standardStartTime);
    }

    /**
     * Get attendance status with automatic late detection.
     */
    public function getCalculatedStatusAttribute(): string
    {
        if ($this->status === 'absent' || $this->status === 'on_leave') {
            return $this->status;
        }

        if ($this->isLate()) {
            return 'late';
        }

        return 'present';
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($attendance) {
            // Auto-detect late status
            if ($attendance->clock_in && $attendance->status === 'present') {
                if ($attendance->isLate()) {
                    $attendance->status = 'late';
                }
            }
        });
    }
}
