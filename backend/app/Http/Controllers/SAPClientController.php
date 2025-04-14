<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\TokenRequisicao;

class SAPClientController extends Controller
{
    /**
     * Lista os BusinessPartners (clientes) do SAP filtrando pelo termo informado
     * pelo front-end, mas retornando somente os registros cujo CardCode inicie com "CLI".
     *
     * Exemplo de URL gerada (quando o termo é "NESTLE"):
     * https://alpina10.ramo.com.br:50000/b1s/v1/BusinessPartners?
     *    $select=CardCode,CardName,CardType&
     *    $filter=startswith(CardCode,'CLI') and (contains(CardName,'NESTLE') or contains(CardCode,'NESTLE'))
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listarPNClientes(Request $request)
    {
        // Recebe o termo enviado pelo front-end (pode estar vazio)
        $termo = trim($request->query('termo', ''));

        // Obtém o token/session necessário para a chamada ao SAP
        $sessionId = TokenRequisicao::getSessionId();
        if (!$sessionId) {
            return response()->json(['erro' => 'Token de sessão não encontrado.'], 401);
        }

        // Define os parâmetros básicos para a consulta (seleciona os campos desejados)
        $queryParams = [
            '$select' => "CardCode,CardName,CardType"
        ];

        // Define o filtro base para retornar somente registros cujo CardCode inicie com "CLI"
        $filtroBase = "startswith(CardCode,'CLI')";

        // Se o termo for fornecido, acrescenta a pesquisa do termo no CardName ou CardCode
        if (!empty($termo)) {
            $filtro = $filtroBase . " and (contains(CardName,'{$termo}') or contains(CardCode,'{$termo}'))";
        } else {
            $filtro = $filtroBase;
        }
        $queryParams['$filter'] = $filtro;

        // Define o endpoint base com o domínio informado
        $baseUrl = "https://alpina10.ramo.com.br:50000/b1s/v1/BusinessPartners";
        $url = $baseUrl . "?" . http_build_query($queryParams);

        try {
            // Realiza a chamada ao SAP Service Layer
            $response = Http::withOptions(['verify' => false])
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Cookie'      => "B1SESSION={$sessionId}"
                ])
                ->timeout(15)
                ->retry(4, 100)
                ->get($url);

            Log::debug('URL utilizada para consulta a BusinessPartners', ['url' => $url]);
            Log::debug('Resposta do SAP', $response->json());

            if (!$response->successful()) {
                return response()->json([
                    'erro'     => 'Erro ao acessar SAP Service Layer',
                    'status'   => $response->status(),
                    'resposta' => $response->body()
                ], $response->status());
            }

            // Extrai os registros retornados (campo "value")
            $partners = $response->json()['value'] ?? [];

            // Mapeia os resultados para um formato simplificado
            $resultado = collect($partners)->map(function ($partner) {
                return [
                    'pn'   => $partner['CardCode'] ?? null,
                    'nome' => $partner['CardName'] ?? $partner['CardCode'] ?? null,
                    'tipo' => $partner['CardType'] ?? null,
                ];
            });

            return response()->json($resultado->values());
        } catch (\Exception $e) {
            Log::error('Erro na requisição de BusinessPartners: ' . $e->getMessage());
            return response()->json(['erro' => 'Erro na requisição: ' . $e->getMessage()], 500);
        }
    }
}
