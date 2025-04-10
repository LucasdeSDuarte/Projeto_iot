<?php

namespace App\Http\Controllers;

use App\Models\Appliance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\ApplianceResource;

class ApplianceController extends Controller
{
    /**
     * Listar todos os appliances com suas torres.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);

        $appliances = Appliance::with('torre')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => ApplianceResource::collection($appliances),
            'meta' => [
                'current_page' => $appliances->currentPage(),
                'per_page'     => $appliances->perPage(),
                'total'        => $appliances->total(),
                'last_page'    => $appliances->lastPage(),
                'links'        => [
                    'next' => $appliances->nextPageUrl(),
                    'prev' => $appliances->previousPageUrl(),
                ],
            ]
        ]);
    }

    /**
     * Cadastrar um novo appliance.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'torre_id' => 'required|exists:torres,id',
                'nome' => 'required|string|max:255',
                'tipo' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'rota' => 'nullable|string|max:255',
            ]);

            $appliance = Appliance::create($validated);
            $appliance->load('torre');

            return response()->json([
                'status' => 'success',
                'message' => 'Appliance cadastrado com sucesso.',
                'data' => new ApplianceResource($appliance)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar appliance', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao cadastrar appliance.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar um appliance existente.
     */
    public function update(Request $request, Appliance $appliance)
    {
        try {
            $validated = $request->validate([
                'torre_id' => 'required|exists:torres,id',
                'nome' => 'required|string|max:255',
                'tipo' => 'required|string|max:255',
                'descricao' => 'nullable|string',
                'rota' => 'nullable|string|max:255',
            ]);

            $appliance->update($validated);
            $appliance->load('torre');

            return response()->json([
                'status' => 'success',
                'message' => 'Appliance atualizado com sucesso.',
                'data' => new ApplianceResource($appliance)
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar appliance', ['error' => $e->getMessage()]);

            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar appliance.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir um appliance.
     */
    public function destroy(Appliance $appliance)
    {
        $appliance->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Appliance excluído com sucesso.'
        ]);
    }
}
