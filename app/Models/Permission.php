<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Permission as SpatiePermission;
// use OwenIt\Auditing\Contracts\Auditable;
// use OwenIt\Auditing\Auditable as AuditableTrait;

class Permission extends SpatiePermission
{
    use HasFactory;
    // use AuditableTrait;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
    ];
}