<?php

namespace App\Http\Controllers;

use App\Models\Alarme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\AlarmeResource;

class AlarmeController extends Controller
{
    /**
     * Listar todos os alarmes com paginação.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);

        $alarmes = Alarme::with('sensor.appliance')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data'   => AlarmeResource::collection($alarmes),
            'meta'   => [
                'current_page' => $alarmes->currentPage(),
                'per_page'     => $alarmes->perPage(),
                'total'        => $alarmes->total(),
                'last_page'    => $alarmes->lastPage(),
                'links'        => [
                    'next' => $alarmes->nextPageUrl(),
                    'prev' => $alarmes->previousPageUrl(),
                ],
            ],
        ]);
    }

    /**
     * Cadastrar novo alarme.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'sensor_id'     => 'required|exists:sensores,id',
                'descricao'     => 'required|string|max:255',
                'valor_alarme'  => 'required|numeric',
                'email'         => 'required|email|max:255',
                'ativo'         => 'boolean',
            ]);

            if (!isset($validated['ativo'])) {
                $validated['ativo'] = true;
            }

            $alarme = Alarme::create($validated);
            $alarme->load('sensor.appliance');

            return response()->json([
                'status'  => 'success',
                'message' => 'Alarme cadastrado com sucesso.',
                'data'    => new AlarmeResource($alarme)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar alarme', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao cadastrar alarme.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar alarme existente.
     */
    public function update(Request $request, Alarme $alarme)
    {
        try {
            $validated = $request->validate([
                'sensor_id'     => 'required|exists:sensores,id',
                'descricao'     => 'required|string|max:255',
                'valor_alarme'  => 'required|numeric',
                'email'         => 'required|email|max:255',
                'ativo'         => 'boolean',
            ]);

            $alarme->update($validated);
            $alarme->load('sensor.appliance');

            return response()->json([
                'status'  => 'success',
                'message' => 'Alarme atualizado com sucesso.',
                'data'    => new AlarmeResource($alarme)
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar alarme', ['error' => $e->getMessage()]);
            return response()->json([
                'status'  => 'error',
                'message' => 'Erro ao atualizar alarme.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir ou desativar um alarme.
     */
    public function destroy(Alarme $alarme)
    {
        // Caso queira usar exclusão lógica:
        // $alarme->update(['ativo' => false]);

        $alarme->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Alarme excluído com sucesso.'
        ]);
    }
}
