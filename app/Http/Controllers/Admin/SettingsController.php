<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    /**
     * Display the settings page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $this->authorize('view settings');

        $settings = Setting::orderBy('group')->orderBy('order')->get();
        $groups = $settings->pluck('group')->unique();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'groups' => $groups,
        ]);
    }

    /**
     * Update the specified settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $this->authorize('edit settings');

        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:settings,key',
            'settings.*.value' => 'nullable',
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::set($setting['key'], $setting['value']);
        }

        // Clear the settings cache
        Cache::forget('settings');

        return redirect()->route('admin.settings.index')->with('success', 'Settings updated successfully.');
    }
}
