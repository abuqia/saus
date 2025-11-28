<?php

namespace App\Http\Controllers;

use App\Services\SettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    protected $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Display settings page
     */
    public function index()
    {
        $settings = $this->settingService->getAllGrouped();

        return Inertia::render('settings/index', [
            'settings' => $settings,
            'groups' => [
                'general' => 'General',
                'appearance' => 'Appearance',
                'auth' => 'Authentication',
                'mail' => 'Mail Configuration',
                'services' => 'Third Party Services',
                'seo' => 'SEO Settings',
                'payment' => 'Payment Gateway',
                'social' => 'Social Media',
                'custom' => 'Custom Settings',
            ],
            'fieldTypes' => [
                'string' => 'Text',
                'text' => 'Text Area',
                'boolean' => 'Yes/No',
                'integer' => 'Number',
                'json' => 'JSON',
            ],
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $this->settingService->set($key, $value);
        }

        // Clear cache
        $this->settingService->clearCache();

        return redirect()->back()->with('success', 'Settings updated successfully!');
    }

    /**
     * Update settings by group
     */
    public function updateGroup(Request $request, $group)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'nullable',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $this->settingService->set($key, $value, 'string', $group);
        }

        $this->settingService->clearCache();

        return redirect()->back()->with('success', ucfirst($group).' settings updated successfully!');
    }

    /**
     * Create new custom setting
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'key' => 'required|string|alpha_dash|unique:settings,key',
            'value' => 'nullable',
            'type' => 'required|in:string,text,boolean,integer,json',
            'group' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $setting = $this->settingService->createCustom($validated);

        return redirect()->back()->with('success', 'Custom setting created successfully!');
    }

    /**
     * Delete custom setting
     */
    public function destroy($key)
    {
        $deleted = $this->settingService->deleteCustom($key);

        if ($deleted) {
            return redirect()->back()->with('success', 'Setting deleted successfully!');
        }

        return redirect()->back()->with('error', 'Cannot delete this setting.');
    }

    /**
     * Upload logo/favicon
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpeg,png,jpg,gif,svg,ico|max:2048',
            'type' => 'required|in:logo,favicon',
        ]);

        $file = $request->file('file');
        $type = $request->type;

        $path = $file->store("settings/{$type}", 'public');

        // Update setting
        $this->settingService->set($type, $path);

        return response()->json([
            'success' => true,
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }

    /**
     * Test mail configuration
     */
    public function testMail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $result = $this->settingService->testMailConfiguration($request->email);

        if ($result['success']) {
            return response()->json([
                'success' => true,
                'message' => $result['message'],
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['message'],
        ], 422);
    }

    /**
     * Apply settings to config
     */
    public function applyConfig()
    {
        // Apply mail config
        $this->settingService->applyMailConfig();

        return redirect()->back()->with('success', 'Configuration applied successfully!');
    }

    /**
     * Get public settings (for API)
     */
    public function public()
    {
        $settings = $this->settingService->getPublicSettings();

        return response()->json($settings);
    }

    /**
     * Reset setting to default
     */
    public function reset($key)
    {
        $defaults = [
            'app_name' => 'SAUS',
            'primary_color' => '#F53003',
            'registration_enabled' => true,
            'mail_mailer' => 'smtp',
            'mail_port' => 2525,
            'mail_encryption' => 'tls',
            'mail_from_name' => 'SAUS',
            'mail_from_address' => 'noreply@saus.id',
            'mail_timeout' => 30,
            'test_email_recipient' => 'noreply@saus.id',
            'registration_enabled' => true,
            'primary_color' => '#F53003',
            'app_name' => 'SAUS',
        ];

        if (array_key_exists($key, $defaults)) {
            $this->settingService->set($key, $defaults[$key]);
            $this->settingService->clearCache();

            return redirect()->back()->with('success', 'Setting reset to default successfully!');
        }

        return redirect()->back()->with('error', 'Default value not found for this setting.');
    }
}
