<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ClienteController extends Controller
{
    public function index()
    {
        return response()->json(Cliente::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'login' => 'required|string|max:255|unique:clientes',
            'senha' => 'required|string|min:6',
            'email' => 'nullable|email|max:255',
            'ativo' => 'boolean',
        ]);

        $validated['senha'] = Hash::make($validated['senha']);

        $cliente = Cliente::create($validated);

        return response()->json($cliente, 201);
    }

    public function update(Request $request, Cliente $cliente)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'login' => 'required|string|max:255|unique:clientes,login,' . $cliente->id,
            'senha' => 'nullable|string|min:6',
            'email' => 'nullable|email|max:255',
            'ativo' => 'boolean',
        ]);

        if (!empty($validated['senha'])) {
            $validated['senha'] = Hash::make($validated['senha']);
        } else {
            unset($validated['senha']);
        }

        $cliente->update($validated);

        return response()->json($cliente);
    }
} 
