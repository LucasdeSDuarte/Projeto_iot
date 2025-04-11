<?php

namespace App\Http\Controllers;

use App\Models\Cliente;

class TopologiaController extends Controller
{
    public function index()
    {
        $clientes = Cliente::with([
            'torres.appliances.sensores.alarmes'
        ])->where('ativo', true)->get();

        return response()->json($clientes);
    }
}
