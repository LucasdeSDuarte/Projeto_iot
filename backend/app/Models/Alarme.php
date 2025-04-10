<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alarme extends Model
{
    use HasFactory;

    protected $fillable = ['sensor_id', 'descricao', 'valor_alarme', 'email', 'ativo'];
    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function sensor()
    {
        return $this->belongsTo(Sensor::class);
    }
}

