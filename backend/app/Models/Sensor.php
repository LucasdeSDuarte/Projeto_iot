<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sensor extends Model
{
    use HasFactory;

    protected $fillable = ['appliance_id', 'tipo', 'unidade', 'identificador'];
    protected $table = 'sensores';

    public function appliance()
    {
        return $this->belongsTo(Appliance::class);
    }

    public function alarmes()
    {
        return $this->hasMany(Alarme::class);
    }
}
