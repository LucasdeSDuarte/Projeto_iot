<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appliance extends Model
{
    use HasFactory;

    protected $fillable = ['torre_id', 'nome', 'tipo', 'descricao', 'rota', 'ativo'];
    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function torre()
    {
        return $this->belongsTo(Torre::class);
    }

    public function sensores()
    {
        return $this->hasMany(Sensor::class);
    }
}

