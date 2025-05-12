<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\ClienteResource;

class ClienteController extends Controller
{
    /**
     * Listar os clientes com paginação.
     */
    public function index(Request $request)
    {
        // Define quantos itens por página (padrão 10)
        $perPage = $request->query('per_page', 10);

        // Utiliza o paginate para obter os clientes
        $clientes = Cliente::paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data'   => ClienteResource::collection($clientes),
            'meta'   => [
                'current_page' => $clientes->currentPage(),
                'per_page'     => $clientes->perPage(),
                'total'        => $clientes->total(),
                'last_page'    => $clientes->lastPage(),
                'links'        => [
                    'next' => $clientes->nextPageUrl(),
                    'prev' => $clientes->previousPageUrl(),
                ],
            ],
        ]);
    }
    public function listaSimples()
    {
        return \App\Models\Cliente::orderBy('nome')
            ->get(['id', 'nome', 'email', 'ativo']);
    }

    /**
     * Cadastrar um novo cliente.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'nome'  => 'required|string|max:255',
                'login' => 'required|string|max:255|unique:clientes,login',
                'senha' => 'required|string|min:6',
                'email' => 'nullable|email|max:255',
                'ativo' => 'boolean',
            ]);

            // Se 'ativo' não for informado, setar como true (ativo)
            if (!isset($validated['ativo'])) {
                $validated['ativo'] = true;
            }

            // Realiza o hash da senha para segurança
            $validated['senha'] = Hash::make($validated['senha']);

            $cliente = Cliente::create($validated);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente cadastrado com sucesso.',
                'data'    => new ClienteResource($cliente)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao cadastrar cliente', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao cadastrar cliente.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar um cliente existente.
     */
    public function update(Request $request, Cliente $cliente)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'nome'  => 'required|string|max:255',
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

            DB::commit();

            // Atualiza o modelo para ter certeza de que os dados são os mais recentes
            $cliente->refresh();

            return response()->json([
                'status'  => 'success',
                'message' => 'Cliente atualizado com sucesso.',
                'data'    => new ClienteResource($cliente)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar cliente', ['error' => $e->getMessage()]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao atualizar cliente.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
