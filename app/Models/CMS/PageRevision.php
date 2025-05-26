<?php

namespace App\Models\CMS;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageRevision extends Model
{
    use HasFactory;

    protected $table = 'cms_page_revisions';

    protected $fillable = [
        'page_id',
        'revision_number',
        'title',
        'excerpt',
        'content',
        'content_blocks',
        'template',
        'layout',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'created_by',
        'revision_notes',
        'is_current',
        'is_published',
    ];

    protected $casts = [
        'content_blocks' => 'array',
        'meta_keywords' => 'array',
        'is_current' => 'boolean',
        'is_published' => 'boolean',
    ];

    /**
     * Get the page this revision belongs to.
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    /**
     * Get the user who created this revision.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope for current revisions.
     */
    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }

    /**
     * Scope for published revisions.
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Get the differences between this revision and another.
     */
    public function getDifferences(PageRevision $otherRevision): array
    {
        $differences = [];
        $fields = ['title', 'excerpt', 'content', 'meta_title', 'meta_description'];

        foreach ($fields as $field) {
            if ($this->$field !== $otherRevision->$field) {
                $differences[$field] = [
                    'old' => $otherRevision->$field,
                    'new' => $this->$field,
                ];
            }
        }

        return $differences;
    }

    /**
     * Get a summary of changes in this revision.
     */
    public function getChangesSummary(): string
    {
        if ($this->revision_notes) {
            return $this->revision_notes;
        }

        $previousRevision = $this->page->revisions()
            ->where('revision_number', '<', $this->revision_number)
            ->orderBy('revision_number', 'desc')
            ->first();

        if (!$previousRevision) {
            return 'Initial revision';
        }

        $differences = $this->getDifferences($previousRevision);
        $changes = [];

        foreach ($differences as $field => $diff) {
            $changes[] = ucfirst(str_replace('_', ' ', $field)) . ' updated';
        }

        return empty($changes) ? 'No changes detected' : implode(', ', $changes);
    }
}
