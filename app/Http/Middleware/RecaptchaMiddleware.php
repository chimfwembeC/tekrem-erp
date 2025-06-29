<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\Setting;
use Symfony\Component\HttpFoundation\Response;

class RecaptchaMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $action = 'login'): Response
    {
        // Skip reCAPTCHA in development environment
        if (app()->environment('local', 'development', 'dev')) {
            return $next($request);
        }

        // Check if reCAPTCHA is enabled
        if (!Setting::get('recaptcha.recaptcha_enabled', false)) {
            return $next($request);
        }

        // Check if reCAPTCHA is enabled for this specific action
        $actionSetting = "recaptcha.recaptcha_on_{$action}";
        if (!Setting::get($actionSetting, true)) {
            return $next($request);
        }

        // Only validate on POST requests
        if (!$request->isMethod('post')) {
            return $next($request);
        }

        $token = $request->input('recaptcha_token');
        
        if (!$token) {
            return redirect()->back()
                ->withErrors(['recaptcha_token' => 'reCAPTCHA verification is required.'])
                ->withInput($request->except('password', 'password_confirmation'));
        }

        if (!$this->validateRecaptcha($token, $request->ip())) {
            return redirect()->back()
                ->withErrors(['recaptcha_token' => 'reCAPTCHA verification failed. Please try again.'])
                ->withInput($request->except('password', 'password_confirmation'));
        }

        return $next($request);
    }

    /**
     * Validate reCAPTCHA token.
     */
    private function validateRecaptcha(string $token, string $ip): bool
    {
        $secretKey = Setting::get('recaptcha.recaptcha_secret_key');
        if (!$secretKey) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => $ip,
            ]);

            $result = $response->json();

            if (!$result['success']) {
                return false;
            }

            // For reCAPTCHA v3, check score
            $version = Setting::get('recaptcha.recaptcha_version', 'v2');
            if ($version === 'v3') {
                $scoreThreshold = (float) Setting::get('recaptcha.recaptcha_score_threshold', 0.5);
                $score = $result['score'] ?? 0;
                return $score >= $scoreThreshold;
            }

            return true;
        } catch (\Exception $e) {
            \Log::error('reCAPTCHA validation error: ' . $e->getMessage());
            return false;
        }
    }
}
