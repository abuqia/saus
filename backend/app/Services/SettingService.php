<?php

namespace App\Services;

use App\Models\Setting;

class SettingService
{
    protected $cache = [];

    protected $cacheEnabled = true;

    /**
     * Get all settings grouped by category
     */
    public function getAllGrouped()
    {
        return Setting::orderBy('group')
            ->orderBy('order')
            ->get()
            ->groupBy('group');
    }

    /**
     * Get settings by group
     */
    public function getByGroup($group)
    {
        $cacheKey = "group_{$group}";

        if ($this->cacheEnabled && isset($this->cache[$cacheKey])) {
            return $this->cache[$cacheKey];
        }

        $settings = Setting::where('group', $group)
            ->orderBy('order')
            ->get()
            ->keyBy('key');

        if ($this->cacheEnabled) {
            $this->cache[$cacheKey] = $settings;
        }

        return $settings;
    }

    /**
     * Get single setting value
     */
    public function get($key, $default = null)
    {
        if ($this->cacheEnabled && isset($this->cache[$key])) {
            return $this->cache[$key];
        }

        $value = Setting::getValue($key, $default);

        if ($this->cacheEnabled) {
            $this->cache[$key] = $value;
        }

        return $value;
    }

    /**
     * Set multiple settings
     */
    public function setMultiple(array $settings, $group = 'general'): void
    {
        foreach ($settings as $key => $value) {
            $this->set($key, $value, 'string', $group);
        }
    }

    /**
     * Set single setting
     */
    public function set($key, $value, $type = 'string', $group = 'general'): void
    {
        Setting::setValue($key, $value, $type, $group);

        // Update cache
        if ($this->cacheEnabled) {
            $this->cache[$key] = $value;
        }
    }

    /**
     * Create custom setting
     */
    public function createCustom(array $data)
    {
        $setting = Setting::createCustom($data);
        $this->clearCache();

        return $setting;
    }

    /**
     * Delete custom setting
     */
    public function deleteCustom($key)
    {
        $setting = Setting::where('key', $key)
            ->where('is_deletable', true)
            ->first();

        if ($setting) {
            $setting->delete();
            $this->clearCache();

            return true;
        }

        return false;
    }

    /**
     * Get settings for public API
     */
    public function getPublicSettings()
    {
        return Setting::public()
            ->get()
            ->pluck('value', 'key')
            ->toArray();
    }

    /**
     * Get editable settings
     */
    public function getEditableSettings()
    {
        return Setting::editable()
            ->orderBy('group')
            ->orderBy('order')
            ->get();
    }

    /**
     * Initialize default settings dengan mail configuration
     */
    public function initializeDefaults(): void
    {
        $defaultSettings = [
            // General Settings
            [
                'key' => 'app_name',
                'value' => 'SAUS',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Nama aplikasi',
                'order' => 1,
            ],
            [
                'key' => 'app_description',
                'value' => 'Advanced Link-in-Bio SaaS Platform',
                'type' => 'text',
                'group' => 'general',
                'description' => 'Deskripsi aplikasi',
                'order' => 2,
            ],
            [
                'key' => 'app_url',
                'value' => config('app.url'),
                'type' => 'string',
                'group' => 'general',
                'description' => 'URL aplikasi',
                'order' => 3,
            ],
            [
                'key' => 'timezone',
                'value' => 'Asia/Jakarta',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Zona waktu default',
                'order' => 4,
            ],
            [
                'key' => 'locale',
                'value' => 'id',
                'type' => 'string',
                'group' => 'general',
                'description' => 'Bahasa default',
                'order' => 5,
            ],

            // Appearance Settings
            [
                'key' => 'logo',
                'value' => null,
                'type' => 'string',
                'group' => 'appearance',
                'description' => 'Logo aplikasi',
                'order' => 1,
            ],
            [
                'key' => 'favicon',
                'value' => null,
                'type' => 'string',
                'group' => 'appearance',
                'description' => 'Favicon aplikasi',
                'order' => 2,
            ],
            [
                'key' => 'primary_color',
                'value' => '#F53003',
                'type' => 'string',
                'group' => 'appearance',
                'description' => 'Warna primer aplikasi',
                'order' => 3,
            ],
            [
                'key' => 'secondary_color',
                'value' => '#FF750F',
                'type' => 'string',
                'group' => 'appearance',
                'description' => 'Warna sekunder aplikasi',
                'order' => 4,
            ],
            [
                'key' => 'dark_mode',
                'value' => true,
                'type' => 'boolean',
                'group' => 'appearance',
                'description' => 'Aktifkan dark mode',
                'order' => 5,
            ],

            // Auth Settings
            [
                'key' => 'registration_enabled',
                'value' => true,
                'type' => 'boolean',
                'group' => 'auth',
                'description' => 'Izinkan pendaftaran user baru',
                'order' => 1,
            ],
            [
                'key' => 'email_verification',
                'value' => true,
                'type' => 'boolean',
                'group' => 'auth',
                'description' => 'Wajib verifikasi email',
                'order' => 2,
            ],
            [
                'key' => 'google_oauth_enabled',
                'value' => true,
                'type' => 'boolean',
                'group' => 'auth',
                'description' => 'Aktifkan login dengan Google',
                'order' => 3,
            ],

            // Mail Settings
            [
                'key' => 'mail_mailer',
                'value' => env('MAIL_MAILER', 'smtp'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Mail driver (smtp, sendmail, mailgun, etc)',
                'order' => 1,
                'options' => ['smtp', 'sendmail', 'mailgun', 'ses', 'postmark', 'log', 'array'],
            ],
            [
                'key' => 'mail_host',
                'value' => env('MAIL_HOST', 'smtp.mailtrap.io'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Mail server host',
                'order' => 2,
            ],
            [
                'key' => 'mail_port',
                'value' => env('MAIL_PORT', 2525),
                'type' => 'integer',
                'group' => 'mail',
                'description' => 'Mail server port',
                'order' => 3,
            ],
            [
                'key' => 'mail_username',
                'value' => env('MAIL_USERNAME'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Mail server username',
                'order' => 4,
                'is_encrypted' => true,
            ],
            [
                'key' => 'mail_password',
                'value' => env('MAIL_PASSWORD'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Mail server password',
                'order' => 5,
                'is_encrypted' => true,
            ],
            [
                'key' => 'mail_encryption',
                'value' => env('MAIL_ENCRYPTION', 'tls'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Mail encryption (tls, ssl)',
                'order' => 6,
                'options' => ['tls', 'ssl', null],
            ],
            [
                'key' => 'mail_from_name',
                'value' => env('MAIL_FROM_NAME', 'SAUS'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Default sender name',
                'order' => 7,
            ],
            [
                'key' => 'mail_from_address',
                'value' => env('MAIL_FROM_ADDRESS', 'noreply@example.com'),
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Default sender email',
                'order' => 8,
            ],
            [
                'key' => 'mail_timeout',
                'value' => env('MAIL_TIMEOUT', 30),
                'type' => 'integer',
                'group' => 'mail',
                'description' => 'Mail timeout in seconds',
                'order' => 9,
            ],

            // Test Email Configuration
            [
                'key' => 'test_email_recipient',
                'value' => null,
                'type' => 'string',
                'group' => 'mail',
                'description' => 'Email address to send test emails',
                'order' => 10,
            ],

            // Additional Services
            [
                'key' => 'mailgun_domain',
                'value' => env('MAILGUN_DOMAIN'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'Mailgun domain',
                'order' => 10,
                'is_encrypted' => true,
            ],
            [
                'key' => 'mailgun_secret',
                'value' => env('MAILGUN_SECRET'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'Mailgun secret key',
                'order' => 11,
                'is_encrypted' => true,
            ],
            [
                'key' => 'aws_access_key_id',
                'value' => env('AWS_ACCESS_KEY_ID'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'AWS Access Key ID',
                'order' => 12,
                'is_encrypted' => true,
            ],
            [
                'key' => 'aws_secret_access_key',
                'value' => env('AWS_SECRET_ACCESS_KEY'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'AWS Secret Access Key',
                'order' => 13,
                'is_encrypted' => true,
            ],

            // Google Services
            [
                'key' => 'google_client_id',
                'value' => env('GOOGLE_CLIENT_ID'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'Google OAuth Client ID',
                'order' => 1,
                'is_encrypted' => true,
            ],
            [
                'key' => 'google_client_secret',
                'value' => env('GOOGLE_CLIENT_SECRET'),
                'type' => 'string',
                'group' => 'services',
                'description' => 'Google OAuth Client Secret',
                'order' => 2,
                'is_encrypted' => true,
            ],
            [
                'key' => 'google_analytics_id',
                'value' => null,
                'type' => 'string',
                'group' => 'services',
                'description' => 'Google Analytics Tracking ID',
                'order' => 3,
            ],

            // SEO Settings
            [
                'key' => 'meta_title',
                'value' => 'SAUS - Advanced Link-in-Bio Platform',
                'type' => 'string',
                'group' => 'seo',
                'description' => 'Meta title default',
                'order' => 1,
            ],
            [
                'key' => 'meta_description',
                'value' => 'Platform link-in-bio modern dengan fitur AI, analytics, dan e-commerce',
                'type' => 'text',
                'group' => 'seo',
                'description' => 'Meta description default',
                'order' => 2,
            ],
            [
                'key' => 'meta_keywords',
                'value' => 'link in bio, saas, links, social media, analytics',
                'type' => 'string',
                'group' => 'seo',
                'description' => 'Meta keywords',
                'order' => 3,
            ],
        ];

        foreach ($defaultSettings as $setting) {
            Setting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }

    /**
     * Apply mail settings to config
     */
    public function applyMailConfig(): void
    {
        config([
            'mail.default' => $this->get('mail_mailer', 'smtp'),
            'mail.mailers.smtp.host' => $this->get('mail_host'),
            'mail.mailers.smtp.port' => $this->get('mail_port'),
            'mail.mailers.smtp.username' => $this->get('mail_username'),
            'mail.mailers.smtp.password' => $this->get('mail_password'),
            'mail.mailers.smtp.encryption' => $this->get('mail_encryption'),
            'mail.mailers.smtp.timeout' => $this->get('mail_timeout', 30),
            'mail.from.address' => $this->get('mail_from_address'),
            'mail.from.name' => $this->get('mail_from_name'),
        ]);
    }

    /**
     * Test mail configuration
     */
    public function testMailConfiguration($toEmail = null)
    {
        $this->applyMailConfig();

        try {
            \Mail::raw('Test email from SAUS Settings', function ($message) use ($toEmail) {
                $message->to($toEmail ?: $this->get('test_email_recipient'))
                    ->subject('SAUS Mail Configuration Test');
            });

            return ['success' => true, 'message' => 'Test email sent successfully!'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Clear settings cache
     */
    public function clearCache(): void
    {
        $this->cache = [];
    }
}
