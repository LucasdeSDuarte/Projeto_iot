<?php

namespace App\Http\Controllers;

use App\Models\Torre;
use App\Models\Appliance;
use App\Models\Sensor;
use App\Models\Cliente;
use App\Models\Alarme;

class DashboardController extends Controller
{
    public function indicadores()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'torres'     => Torre::where('ativo', true)->count(),
                'appliances' => Appliance::where('ativo', true)->count(),
                'sensores'   => Sensor::where('ativo', true)->count(),
                'clientes'   => Cliente::where('ativo', true)->count(),
                'alarmes'    => Alarme::where('ativo', true)->count(),
            ]
        ]);
    }
}
