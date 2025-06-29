<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Jetstream\Jetstream;
use App\Notifications\UserRegistered;
use App\Notifications\NewUserRegisteredAdmin;
use Illuminate\Support\Facades\Notification;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
            'terms' => Jetstream::hasTermsAndPrivacyPolicyFeature() ? ['accepted', 'required'] : '',
        ];

        // Add reCAPTCHA validation if enabled
        if (Setting::get('recaptcha.recaptcha_enabled', false) && Setting::get('recaptcha.recaptcha_on_register', true)) {
            $rules['recaptcha_token'] = ['required', 'string'];
        }

        $validator = Validator::make($input, $rules);

        // Validate reCAPTCHA if enabled
        if (Setting::get('recaptcha.recaptcha_enabled', false) && Setting::get('recaptcha.recaptcha_on_register', true)) {
            $validator->after(function ($validator) use ($input) {
                if (!$this->validateRecaptcha($input['recaptcha_token'] ?? '')) {
                    $validator->errors()->add('recaptcha_token', 'reCAPTCHA verification failed.');
                }
            });
        }

        $validator->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);

        // Notify the user
        $user->notify(new UserRegistered($user));

        // Notify all admins
        $admins = User::role('admin')->get();
        Notification::send($admins, new NewUserRegisteredAdmin($user));
        // Assign the 'customer' role to the new user
        $user->assignRole('customer');

        return $user;
    }

    /**
     * Validate reCAPTCHA token.
     */
    private function validateRecaptcha(string $token): bool
    {
        if (empty($token)) {
            return false;
        }

        $secretKey = Setting::get('recaptcha.recaptcha_secret_key');
        if (!$secretKey) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secretKey,
                'response' => $token,
                'remoteip' => request()->ip(),
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
            return false;
        }
    }
}
