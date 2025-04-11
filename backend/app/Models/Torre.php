<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Torre extends Model
{
    use HasFactory;

    // Campos que podem ser atribuídos em massa
    protected $fillable = [
        'cliente_id',
        'nome',
        'projeto',
        'localizacao',
        'ativo',
    ];

    // Conversão de tipos
    protected $casts = [
        'ativo' => 'boolean',
    ];

    // Relacionamento com Cliente
    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    // Relacionamento com Appliances
    public function appliances()
    {
        return $this->hasMany(Appliance::class);
    }
}
