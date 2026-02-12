<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Major extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'category',
    ];

    public function classes(): HasMany
    {
        return $this->hasMany(Classes::class, 'major_id');
    }
}
