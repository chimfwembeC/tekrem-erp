<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register gates for all permissions
        try {
            Permission::all()->each(function ($permission) {
                Gate::define($permission->name, function (User $user) use ($permission) {
                    // Use Spatie's hasPermissionTo method
                    return $user->hasPermissionTo($permission->name);
                });
            });
        } catch (\Exception $e) {
            // Handle the case when the permissions table doesn't exist yet (during migrations)
            // This prevents errors when running migrations for the first time
        }
    }
}
