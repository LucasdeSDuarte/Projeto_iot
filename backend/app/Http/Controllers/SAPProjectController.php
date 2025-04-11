<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\TokenRequisicao;

class SAPProjectController extends Controller
{
    /**
     * Normaliza uma string removendo acentos para comparação.
     *
     * @param string $string
     * @return string
     */
    private function normalizar($string)
    {
        // Converte para UTF-8 e remove acentos (usa iconv para transliteração)
        return iconv('UTF-8', 'ASCII//TRANSLIT', $string);
    }

    /**
     * Lista os PN dos clientes (Business Partners) do SAP,
     * considerando somente os cujo CardCode comece com "CLI".
     *
     * Filtra pelo termo, buscando em CardName e CardCode.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */public function listarPNClientes(Request $request)
{
    $termo = $request->query('termo', '');

    $sessionId = TokenRequisicao::getSessionId();
    if (!$sessionId) {
        return response()->json(['erro' => 'Token de sessão não encontrado.'], 401);
    }

    // Corrigindo o filtro OData para usar o valor correto "cCustomer"
    $filtroOData = "\$filter=startswith(CardCode,'CLI') and CardType eq 'cCustomer' and (contains(CardName,'{$termo}') or contains(CardCode,'{$termo}'))";

    $url = "https://alpina10.ramo.com.br:50000/b1s/v1/BusinessPartners?{$filtroOData}";

    try {
        $response = Http::withOptions(['verify' => false])
            ->withHeaders([
                'Content-Type' => 'application/json',
                'Cookie'      => "B1SESSION={$sessionId}"
            ])
            ->get($url);

        Log::debug('Resposta SAP BusinessPartners com filtro:', $response->json());

        if (!$response->successful()) {
            return response()->json([
                'erro'     => 'Erro ao acessar SAP Service Layer',
                'status'   => $response->status(),
                'resposta' => $response->body()
            ], $response->status());
        }

        $partners = $response->json()['value'] ?? [];

        // Mapeia diretamente para retornar o resultado
        $resultado = collect($partners)->map(function ($partner) {
            return [
                'pn'   => $partner['CardCode'],
                'nome' => $partner['CardName'] ?? $partner['CardCode'],
            ];
        });

        return response()->json($resultado->values());

    } catch (\Exception $e) {
        return response()->json(['erro' => 'Erro na requisição: ' . $e->getMessage()], 500);
    }
}


}
