<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Redirect extends Model
{
    use HasFactory;

    protected $table = 'cms_redirects';

    protected $fillable = [
        'from_url',
        'to_url',
        'status_code',
        'is_active',
        'hit_count',
        'last_hit_at',
        'description',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_hit_at' => 'datetime',
    ];

    /**
     * Get the user who created this redirect.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for active redirects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Find redirect by URL.
     */
    public static function findByUrl(string $url): ?self
    {
        return static::active()
            ->where('from_url', $url)
            ->first();
    }

    /**
     * Record a hit for this redirect.
     */
    public function recordHit(): void
    {
        $this->increment('hit_count');
        $this->update(['last_hit_at' => now()]);
    }

    /**
     * Get available status codes.
     */
    public static function getStatusCodes(): array
    {
        return [
            301 => '301 - Moved Permanently',
            302 => '302 - Found (Temporary)',
            303 => '303 - See Other',
            307 => '307 - Temporary Redirect',
            308 => '308 - Permanent Redirect',
        ];
    }

    /**
     * Validate URLs.
     */
    public function validateUrls(): array
    {
        $errors = [];

        // Check if from_url is valid
        if (!filter_var($this->from_url, FILTER_VALIDATE_URL) && !str_starts_with($this->from_url, '/')) {
            $errors['from_url'] = 'The from URL must be a valid URL or path.';
        }

        // Check if to_url is valid
        if (!filter_var($this->to_url, FILTER_VALIDATE_URL) && !str_starts_with($this->to_url, '/')) {
            $errors['to_url'] = 'The to URL must be a valid URL or path.';
        }

        // Check for circular redirects
        if ($this->from_url === $this->to_url) {
            $errors['to_url'] = 'The destination URL cannot be the same as the source URL.';
        }

        // Check for existing redirect with same from_url
        $existing = static::where('from_url', $this->from_url)
            ->where('id', '!=', $this->id)
            ->first();

        if ($existing) {
            $errors['from_url'] = 'A redirect for this URL already exists.';
        }

        return $errors;
    }

    /**
     * Get redirect statistics.
     */
    public static function getStatistics(): array
    {
        return [
            'total_redirects' => static::count(),
            'active_redirects' => static::active()->count(),
            'total_hits' => static::sum('hit_count'),
            'most_used' => static::orderBy('hit_count', 'desc')->limit(5)->get(),
            'recent_hits' => static::whereNotNull('last_hit_at')
                ->orderBy('last_hit_at', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
}
