<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Cliente extends Model
{
    use HasApiTokens, HasFactory;

    protected $fillable = ['nome', 'login', 'senha', 'email', 'ativo'];


    public function torres()
    {
        return $this->hasMany(Torre::class);
    }
}
