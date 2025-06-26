<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Check if user has customer role or customer portal access
        if (!$request->user()->hasRole('customer') && !$request->user()->hasPermissionTo('access customer portal')) {
            abort(403, 'Access denied. Customer portal access required.');
        }

        return $next($request);
    }
}
