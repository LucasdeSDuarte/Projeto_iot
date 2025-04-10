<?php

namespace App\Http\Controllers;

use App\Models\Torre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\TorreResource;

class TorreController extends Controller
{
    /**
     * Listar todas as torres com paginação.
     */
    public function index(Request $request)
    {
        // Define quantos itens por página; padrão: 10
        $perPage = $request->query('per_page', 10);

        // Importante: Verifique se o relacionamento de dispositivos
        // está corretamente definido. No seu model Torre, o método
        // é "appliances()" e, no model Sensor, o método é "alarmess()".
        // Assim, para carregar o relacionamento dos dispositivos e
        // sensores com seus alarmesess, o carregamento deve ser:
        // 'appliances.sensors.alarmess'
        $torres = Torre::with(['cliente', 'appliances.sensors.alarmes'])->paginate($perPage);

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

    /**
     * Cadastrar uma nova torre.
     */
    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'cliente_id'  => 'required|exists:clientes,id',
                'nome'        => 'required|string|max:255',
                'localizacao' => 'required|string|max:255',
                'ativo'       => 'boolean',
            ]);

            // Se não informado, define 'ativo' como true
            if (!isset($validated['ativo'])) {
                $validated['ativo'] = true;
            }

            $torre = Torre::create($validated);

            // Carrega os relacionamentos para incluir na resposta.
            // Atenção: Certifique-se de que a relação para alarmesess esteja
            // definida de forma consistente. Se o seu model Sensor usa "alarmess",
            // o correto é "appliances.sensors.alarmess" (no plural).
            $torre->load(['cliente', 'appliances.sensors.alarmes']);

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

    /**
     * Atualizar uma torre existente.
     */
    public function update(Request $request, Torre $torre)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'cliente_id'  => 'required|exists:clientes,id',
                'nome'        => 'required|string|max:255',
                'localizacao' => 'required|string|max:255',
                'ativo'       => 'boolean',
            ]);

            $torre->update($validated);

            DB::commit();

            // Recarrega os relacionamentos atualizados
            $torre->load(['cliente', 'appliances.sensors.alarmes']);

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

    /**
     * Excluir uma torre.
     *
     * Se preferir apenas desabilitar, você pode atualizar o campo "ativo" em vez de excluir.
     */
    public function destroy(Torre $torre)
    {
        try {
            // Se quiser apenas desabilitar, comente a linha abaixo e use:
            // $torre->update(['ativo' => false]);
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
