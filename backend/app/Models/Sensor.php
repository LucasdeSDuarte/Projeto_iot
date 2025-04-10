<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Alarme;

class Sensor extends Model
{
    use HasFactory;
    protected $table = 'sensores';
    protected $fillable = ['appliance_id', 'tipo', 'unidade', 'identificador', 'ativo'];

    protected $casts = [
        'ativo' => 'boolean',
    ];

    public function appliance()
    {
        return $this->belongsTo(Appliance::class);
    }

    public function alarmes()
    {
        return $this->hasMany(Alarme::class);
    }
}

