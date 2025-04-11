<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\TokenRequisicao;

class SAPClientController extends Controller
{
    /**
     * Normaliza uma string removendo acentos para comparação.
     *
     * @param string $string
     * @return string
     */
    private function normalizar($string)
    {
        // Converte para UTF-8 e remove acentos (usando iconv para transliteração)
        return iconv('UTF-8', 'ASCII//TRANSLIT', $string);
    }

    /**
     * Lista os PN dos clientes (Business Partners) do SAP.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function listarPNClientes(Request $request)
    {
        $termo = $request->query('termo', '');

        // Obter o token de sessão usando o método da model
        $sessionId = TokenRequisicao::getSessionId();
        if (!$sessionId) {
            return response()->json(['erro' => 'Token de sessão não encontrado.'], 401);
        }

        // URL do endpoint de Business Partners no SAP
        $url = 'https://alpina10.ramo.com.br:50000/b1s/v1/BusinessPartners';

        try {
            // Realiza a requisição GET para obter os Business Partners
            $response = Http::withOptions(['verify' => false])
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Cookie' => "B1SESSION={$sessionId}"
                ])
                ->get($url);

            Log::debug('Resposta SAP BusinessPartners:', $response->json());

            if (!$response->successful()) {
                return response()->json([
                    'erro'     => 'Erro ao acessar SAP Service Layer',
                    'status'   => $response->status(),
                    'resposta' => $response->body()
                ], $response->status());
            }

            // Obtém os parceiros (Business Partners) da chave "value"
            $partners = $response->json()['value'] ?? [];

            // Filtramos para pegar somente os clientes, onde o CardType começa com "c"
            $clientes = collect($partners)->filter(function ($partner) {
                return isset($partner['CardType']) &&
                       strtolower(substr($partner['CardType'], 0, 1)) === 'c';
            });

            // Se houver um termo, filtramos também pelo PN (CardCode) ou nome (CardName),
            // utilizando a normalização para melhorar a busca
            if (!empty($termo)) {
                $termoNormalizado = $this->normalizar(strtolower($termo));
                $clientes = $clientes->filter(function ($partner) use ($termoNormalizado) {
                    $cardCode = $this->normalizar(strtolower($partner['CardCode']));
                    $cardName = $this->normalizar(strtolower($partner['CardName'] ?? ''));
                    return str_contains($cardCode, $termoNormalizado) ||
                           str_contains($cardName, $termoNormalizado);
                });
            }

            // Mapeamos para o formato desejado: exibindo somente o PN
            $resultado = $clientes->map(function ($partner) {
                return [
                    'pn'   => $partner['CardCode'],  // PN é o CardCode
                    'nome' => $partner['CardName'] ?? $partner['CardCode'],
                ];
            })->unique('pn')->values();

            return response()->json($resultado);

        } catch (\Exception $e) {
            return response()->json(['erro' => 'Erro na requisição: ' . $e->getMessage()], 500);
        }
    }
}
