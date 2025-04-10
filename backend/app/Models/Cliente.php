<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Cliente extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'nome',
        'login',
        'senha',
        'email',
        'ativo',
    ];
    protected $casts = [
        'ativo' => 'boolean',
    ];

    protected $hidden = [
        'senha',
        'torres'
    ];

    public function torres()
    {
        return $this->hasMany(Torre::class);
    }
}

