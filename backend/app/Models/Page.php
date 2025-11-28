<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'title',
        'slug',
        'status',
        'data_draft',
        'data_published',
        'published_at',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'data_draft' => 'array',
            'data_published' => 'array',
            'published_at' => 'datetime',
            'version' => 'integer',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function blocks(): HasMany
    {
        return $this->hasMany(PageBlock::class);
    }
}

