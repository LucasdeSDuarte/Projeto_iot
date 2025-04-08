<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Torre extends Model
{
    use HasFactory;

    protected $fillable = ['cliente_id', 'nome', 'localizacao'];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function appliances()
    {
        return $this->hasMany(Appliance::class);
    }
}
