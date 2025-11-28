<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

/**
 * System Settings Model (Global)
 */
class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'description',
        'options',
        'order',
        'is_public',
        'is_encrypted',
        'is_editable',
        'is_deletable',
        'validation_rules',
    ];

    protected $casts = [
        'options' => 'array',
        'is_public' => 'boolean',
        'is_encrypted' => 'boolean',
        'is_editable' => 'boolean',
        'is_deletable' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Accessor untuk decrypt value jika diperlukan
     */
    public function getValueAttribute($value)
    {
        if ($this->is_encrypted && !empty($value)) {
            try {
                return Crypt::decryptString($value);
            } catch (\Exception $e) {
                return $value;
            }
        }

        return $this->castValue($value);
    }

    /**
     * Mutator untuk encrypt value jika diperlukan
     */
    public function setValueAttribute($value)
    {
        if ($this->is_encrypted && !empty($value)) {
            $value = Crypt::encryptString($value);
        }

        $this->attributes['value'] = $value;
    }

    /**
     * Cast value berdasarkan type
     */
    protected function castValue($value)
    {
        if (is_null($value)) {
            return null;
        }

        return match ($this->type) {
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            'json' => json_decode($value, true) ?? $value,
            default => $value,
        };
    }

    /**
     * Scope untuk group tertentu
     */
    public function scopeGroup($query, $group)
    {
        return $query->where('group', $group);
    }

    /**
     * Scope untuk public settings
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Scope untuk editable settings
     */
    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    /**
     * Get setting value by key
     */
    public static function getValue($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        
        if ($setting) {
            return $setting->value;
        }

        return $default;
    }

    /**
     * Set setting value
     */
    public static function setValue($key, $value, $type = 'string', $group = 'general'): void
    {
        $setting = static::firstOrNew(['key' => $key]);
        
        $setting->fill([
            'value' => $value,
            'type' => $type,
            'group' => $group,
        ])->save();
    }

    /**
     * Create new custom setting
     */
    public static function createCustom($data)
    {
        return static::create([
            'key' => $data['key'],
            'value' => $data['value'] ?? null,
            'type' => $data['type'] ?? 'string',
            'group' => $data['group'] ?? 'custom',
            'description' => $data['description'] ?? null,
            'is_editable' => true,
            'is_deletable' => true,
            'order' => $data['order'] ?? 999,
        ]);
    }
}

/**
 * User Settings Model
 */
class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'key',
        'value',
    ];

    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get value (auto json decode if needed)
     */
    public function getValueAttribute($value)
    {
        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    /**
     * Set value (auto json encode if array)
     */
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = is_array($value) ? json_encode($value) : $value;
    }
}

/**
 * Tenant Settings Model
 */
class TenantSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'key',
        'value',
    ];

    /**
     * Relationships
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get value (auto json decode if needed)
     */
    public function getValueAttribute($value)
    {
        $decoded = json_decode($value, true);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : $value;
    }

    /**
     * Set value (auto json encode if array)
     */
    public function setValueAttribute($value)
    {
        $this->attributes['value'] = is_array($value) ? json_encode($value) : $value;
    }
}
