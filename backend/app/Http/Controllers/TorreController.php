<?php

namespace App\Http\Controllers;

use App\Models\Torre;
use App\Models\Cliente;
use Illuminate\Http\Request;

class TorreController extends Controller
{
    // Listar todas as torres
    public function index()
    {
        $torres = Torre::with('cliente')->get(); // Inclui dados do cliente
        return response()->json($torres);
    }

    // Cadastrar uma nova torre
    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'nome' => 'required|string|max:255',
            'localizacao' => 'required|string|max:255',
        ]);

        $torre = Torre::create($request->all());
        return response()->json($torre, 201); // Retorna a torre criada
    }

    // Atualizar uma torre existente
    public function update(Request $request, Torre $torre)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'nome' => 'required|string|max:255',
            'localizacao' => 'required|string|max:255',
        ]);

        $torre->update($request->all()); // Atualiza os dados
        return response()->json($torre);
    }

    // Excluir uma torre (opcional, se necessário)
    public function destroy(Torre $torre)
    {
        $torre->delete();
        return response()->json(['message' => 'Torre excluída com sucesso']);
    }
}
