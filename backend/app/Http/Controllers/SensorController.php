<?php

namespace App\Http\Controllers;

use App\Models\Sensor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Resources\SensorResource;

class SensorController extends Controller
{
    /**
     * Listar sensores com paginação e relacionamento com appliance.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);

        $sensores = Sensor::with('appliance')->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => SensorResource::collection($sensores),
            'meta' => [
                'current_page' => $sensores->currentPage(),
                'per_page'     => $sensores->perPage(),
                'total'        => $sensores->total(),
                'last_page'    => $sensores->lastPage(),
                'links'        => [
                    'next' => $sensores->nextPageUrl(),
                    'prev' => $sensores->previousPageUrl(),
                ],
            ]
        ]);
    }

    /**
     * Cadastrar um novo sensor.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'appliance_id'  => 'required|exists:appliances,id',
                'tipo'          => 'required|string|max:255',
                'unidade'       => 'nullable|string|max:20',
                'identificador' => 'nullable|string|max:255',
                'ativo'         => 'boolean',
            ]);

            if (!isset($validated['ativo'])) {
                $validated['ativo'] = true;
            }

            $sensor = Sensor::create($validated);
            $sensor->load('appliance');

            return response()->json([
                'status' => 'success',
                'message' => 'Sensor cadastrado com sucesso.',
                'data' => new SensorResource($sensor)
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erro ao cadastrar sensor', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao cadastrar sensor.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar um sensor existente.
     */
    public function update(Request $request, Sensor $sensor)
    {
        try {
            $validated = $request->validate([
                'appliance_id'  => 'required|exists:appliances,id',
                'tipo'          => 'required|string|max:255',
                'unidade'       => 'nullable|string|max:20',
                'identificador' => 'nullable|string|max:255',
                'ativo'         => 'boolean',
            ]);

            $sensor->update($validated);
            $sensor->load('appliance');

            return response()->json([
                'status' => 'success',
                'message' => 'Sensor atualizado com sucesso.',
                'data' => new SensorResource($sensor)
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao atualizar sensor', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao atualizar sensor.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Excluir um sensor.
     */
    public function destroy(Sensor $sensor)
    {
        try {
            $sensor->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Sensor excluído com sucesso.'
            ]);
        } catch (\Exception $e) {
            Log::error('Erro ao excluir sensor', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao excluir sensor.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
