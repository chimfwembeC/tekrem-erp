<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasProfilePhoto;
    use HasRoles;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
        'user_roles',
        'user_permissions'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];



    /**
     * Get the clients for the user.
     */
    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    /**
     * Get the leads for the user.
     */
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }

    /**
     * Get the communications created by the user.
     */
    public function communications()
    {
        return $this->hasMany(Communication::class);
    }

    /**
     * Get the chat messages sent by the user.
     */
    public function sentChats()
    {
        return $this->hasMany(Chat::class, 'user_id');
    }

    /**
     * Get the chat messages received by the user.
     */
    public function receivedChats()
    {
        return $this->hasMany(Chat::class, 'recipient_id');
    }

    /**
     * Get the notifications for the user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get the unread notifications for the user.
     */
    public function unreadNotifications()
    {
        return $this->notifications()->unread();
    }

    /**
     * Get the notification preferences for the user.
     */
    public function notificationPreferences()
    {
        return $this->hasOne(UserNotificationPreference::class);
    }

    /**
     * Get or create notification preferences for the user.
     */
    public function getNotificationPreferences(): UserNotificationPreference
    {
        return UserNotificationPreference::getOrCreateForUser($this->id);
    }

   /**
     * The custom roles that belong to the user.
     * This is different from Spatie's roles() method.
     */
    public function customRoles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    /**
     * The permissions that belong to the user directly.
     */
    public function directPermissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class);
    }



    /**
     * Check if the user has a specific permission directly.
     *
     * @param string $permission
     * @return bool
     */
    public function hasDirectPermission(string $permission): bool
    {
        return $this->directPermissions()->where('name', $permission)->exists();
    }

    /**
     * Get the user roles attribute for frontend.
     *
     * @return array
     */
    public function getUserRolesAttribute(): array
    {
        // Use Spatie's getRoleNames() method which returns a collection
        return $this->getRoleNames()->toArray();
    }

    /**
     * Get the user permissions attribute for frontend.
     *
     * @return array
     */
    public function getUserPermissionsAttribute(): array
    {
        // Use Spatie's getAllPermissions() method which returns a collection
        return $this->getAllPermissions()->pluck('name')->toArray();
    }

    // get user tickets
    public function assignedTickets()
    {
        return $this->hasMany(\App\Models\Support\Ticket::class, 'assigned_to');
    }

    /**
     * Get the projects managed by this user.
     */
    public function managedProjects()
    {
        return $this->hasMany(\App\Models\Project::class, 'manager_id');
    }

    /**
     * Get the projects where this user is a team member.
     */
    public function teamProjects()
    {
        return $this->belongsToMany(\App\Models\Project::class, 'project_team_members', 'user_id', 'project_id')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    /**
     * Get the project time logs for this user.
     */
    public function projectTimeLogs()
    {
        return $this->hasMany(\App\Models\ProjectTimeLog::class);
    }

    /**
     * Get the project tasks assigned to this user.
     */
    public function assignedTasks()
    {
        return $this->hasMany(\App\Models\ProjectTask::class, 'assigned_to');
    }

    /**
     * Get the project milestones assigned to this user.
     */
    public function assignedMilestones()
    {
        return $this->hasMany(\App\Models\ProjectMilestone::class, 'assigned_to');
    }

    /**
     * Get the employee record for this user.
     */
    public function employee()
    {
        return $this->hasOne(\App\Models\HR\Employee::class);
    }


}
