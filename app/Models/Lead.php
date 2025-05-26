<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Lead extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'position',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'notes',
        'source',
        'status',
        'user_id',
        'converted_to_client',
        'converted_to_client_id',
        'converted_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'converted_to_client' => 'boolean',
        'converted_at' => 'datetime',
    ];

    /**
     * Get the user that owns the lead.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the client that this lead was converted to.
     */
    public function convertedToClient(): HasOne
    {
        return $this->hasOne(Client::class, 'converted_from_lead_id');
    }

    /**
     * Get the communications for the lead.
     */
    public function communications(): MorphMany
    {
        return $this->morphMany(Communication::class, 'communicable');
    }

    /**
     * Get the quotations for the lead.
     */
    public function quotations(): HasMany
    {
        return $this->hasMany(\App\Models\Finance\Quotation::class);
    }

    /**
     * Get the chats for the lead.
     */
    public function chats(): MorphMany
    {
        return $this->morphMany(Chat::class, 'chattable');
    }
}
