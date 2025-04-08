<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class ColaboradorFake extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['id', 'name'];

    // Não vamos usar email e senha padrão
    public $timestamps = false;

    public function getAuthIdentifierName()
    {
        return 'id';
    }
}
