<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Client extends Model
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
        'status',
        'user_id',
        'converted_from_lead_id',
    ];

    /**
     * Get the user that owns the client.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the lead that was converted to this client.
     */
    public function convertedFromLead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'converted_from_lead_id');
    }

    /**
     * Get the communications for the client.
     */
    public function communications(): MorphMany
    {
        return $this->morphMany(Communication::class, 'communicable');
    }

    /**
     * Get the chats for the client.
     */
    public function chats(): MorphMany
    {
        return $this->morphMany(Chat::class, 'chattable');
    }
}
