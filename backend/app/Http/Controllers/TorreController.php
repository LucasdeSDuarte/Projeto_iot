<?php

namespace App\Http\Controllers;

use App\Models\Torre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\TorreResource;

class TorreController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $projeto = $request->query('projeto');

        $query = Torre::with(['cliente', 'appliances.sensores.alarmes']);

        if ($projeto) {
            $query->where('projeto', 'like', '%' . $projeto . '%');
        }

        $torres = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data'   => TorreResource::collection($torres),
            'meta'   => [
                'current_page' => $torres->currentPage(),
                'per_page'     => $torres->perPage(),
                'total'        => $torres->total(),
                'last_page'    => $torres->lastPage(),
                'links'        => [
                    'next' => $torres->nextPageUrl(),
                    'prev' => $torres->previousPageUrl(),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'cliente_id'  => 'required|exists:clientes,id',
                'nome'        => 'required|string|max:255',
                'projeto'     => 'nullable|string|max:255',
                'localizacao' => 'required|string|max:255',
                'ativo'       => 'nullable|boolean',
            ]);

            $validated['ativo'] = $request->boolean('ativo', true); // default true

            $torre = Torre::create($validated);
            $torre->load(['cliente', 'appliances.sensores.alarmes']);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Torre cadastrada com sucesso.',
                'data'    => new TorreResource($torre)
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao cadastrar torre', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao cadastrar torre.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, Torre $torre)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'cliente_id'  => 'required|exists:clientes,id',
                'nome'        => 'required|string|max:255',
                'projeto'     => 'nullable|string|max:255',
                'localizacao' => 'required|string|max:255',
                'ativo'       => 'nullable|boolean',
            ]);

            $validated['ativo'] = $request->boolean('ativo', true); // default true

            $torre->update($validated);
            $torre->load(['cliente', 'appliances.sensores.alarmes']);

            DB::commit();

            return response()->json([
                'status'  => 'success',
                'message' => 'Torre atualizada com sucesso.',
                'data'    => new TorreResource($torre)
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erro ao atualizar torre', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao atualizar torre.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Torre $torre)
    {
        try {
            $torre->delete();

            return response()->json([
                'status'  => 'success',
                'message' => 'Torre excluída com sucesso.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir torre', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao excluir torre.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
}
