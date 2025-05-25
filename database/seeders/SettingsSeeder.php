<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General settings
            [
                'key' => 'site_name',
                'value' => 'TekRem ERP',
                'group' => 'general',
                'type' => 'string',
                'label' => 'Site Name',
                'description' => 'The name of the site',
                'is_public' => true,
                'order' => 1,
            ],
            [
                'key' => 'site_description',
                'value' => 'Technology Remedies Innovations',
                'group' => 'general',
                'type' => 'string',
                'label' => 'Site Description',
                'description' => 'The description of the site',
                'is_public' => true,
                'order' => 2,
            ],

            // Theme settings
            [
                'key' => 'primary_color',
                'value' => '#3b82f6',
                'group' => 'theme',
                'type' => 'color',
                'label' => 'Primary Color',
                'description' => 'The primary color of the site',
                'is_public' => true,
                'order' => 3,
            ],
            [
                'key' => 'font_family',
                'value' => 'Inter',
                'group' => 'theme',
                'type' => 'select',
                'options' => json_encode(['Inter', 'Roboto', 'Open Sans', 'Montserrat']),
                'label' => 'Font Family',
                'description' => 'The font family of the site',
                'is_public' => true,
                'order' => 4,
            ],
            [
                'key' => 'dark_mode',
                'value' => 'system',
                'group' => 'theme',
                'type' => 'select',
                'options' => json_encode(['light', 'dark', 'system']),
                'label' => 'Dark Mode',
                'description' => 'The dark mode setting of the site',
                'is_public' => true,
                'order' => 5,
            ],

            // Company settings
            [
                'key' => 'company_name',
                'value' => 'Technology Remedies Innovations',
                'group' => 'company',
                'type' => 'string',
                'label' => 'Company Name',
                'description' => 'The name of the company',
                'is_public' => true,
                'order' => 6,
            ],
            [
                'key' => 'company_email',
                'value' => 'tekremsolutions@gmail.com',
                'group' => 'company',
                'type' => 'email',
                'label' => 'Company Email',
                'description' => 'The email of the company',
                'is_public' => true,
                'order' => 7,
            ],
            [
                'key' => 'company_phone',
                'value' => '+260 976607840',
                'group' => 'company',
                'type' => 'string',
                'label' => 'Company Phone',
                'description' => 'The phone number of the company',
                'is_public' => true,
                'order' => 8,
            ],
            [
                'key' => 'company_address',
                'value' => 'Lusaka, Zambia',
                'group' => 'company',
                'type' => 'textarea',
                'label' => 'Company Address',
                'description' => 'The address of the company',
                'is_public' => true,
                'order' => 9,
            ],

            // Additional General Settings
            [
                'key' => 'admin_email',
                'value' => 'admin@tekrem.com',
                'group' => 'general',
                'type' => 'email',
                'label' => 'Admin Email',
                'description' => 'Primary administrator email address',
                'is_public' => false,
                'order' => 10,
            ],
            [
                'key' => 'timezone',
                'value' => 'UTC',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['UTC', 'Africa/Lusaka', 'America/New_York', 'Europe/London', 'Asia/Tokyo']),
                'label' => 'Timezone',
                'description' => 'Default timezone for the application',
                'is_public' => true,
                'order' => 11,
            ],
            [
                'key' => 'date_format',
                'value' => 'Y-m-d',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y']),
                'label' => 'Date Format',
                'description' => 'Default date format for the application',
                'is_public' => true,
                'order' => 12,
            ],
            [
                'key' => 'time_format',
                'value' => 'H:i:s',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['H:i:s', 'h:i:s A', 'H:i', 'h:i A']),
                'label' => 'Time Format',
                'description' => 'Default time format for the application',
                'is_public' => true,
                'order' => 13,
            ],
            [
                'key' => 'currency',
                'value' => 'USD',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['USD', 'ZMW', 'EUR', 'GBP', 'ZAR']),
                'label' => 'Currency',
                'description' => 'Default currency for the application',
                'is_public' => true,
                'order' => 14,
            ],
            [
                'key' => 'language',
                'value' => 'en',
                'group' => 'general',
                'type' => 'select',
                'options' => json_encode(['en', 'fr', 'es', 'de', 'pt']),
                'label' => 'Language',
                'description' => 'Default language for the application',
                'is_public' => true,
                'order' => 15,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
