<?php

 namespace App\Http\Controllers;

 use Illuminate\Http\Request;
 use Illuminate\Support\Facades\Http;
 use Illuminate\Support\Facades\Log;
 use App\Models\TokenRequisicao;

 class SAPProjectController extends Controller
 {
     /**
      * Lista os projetos do SAP B1 Service Layer com base em um termo de busca.
      *
      * @param  \Illuminate\Http\Request  $request
      * @return \Illuminate\Http\JsonResponse
      */
     public function listarProjetos(Request $request)
     {
         $termo = $request->query('termo', '');

         // Buscar o token de sessão usando o método da model
         $sessionId = TokenRequisicao::getSessionId();
         if (!$sessionId) {
             return response()->json(['erro' => 'Token de sessão não encontrado.'], 401);
         }

         // URL da Service Layer do SAP Business One
         $url = 'https://alpina10.ramo.com.br:50000/b1s/v1/ProjectsService_GetProjectList';

         try {
             // Envia um objeto vazio {} em vez de array [] para a Service Layer
             $payload = new \stdClass();

             // Desabilitar verificação SSL para depuração (ajuste para produção)
             $response = Http::withOptions(['verify' => false])
                 ->withHeaders([
                     'Content-Type' => 'application/json',
                     'Cookie' => "B1SESSION={$sessionId}"
                 ])
                 ->post($url, $payload);

             Log::debug('Resposta SAP Projects:', $response->json());

             if (!$response->successful()) {
                 return response()->json([
                     'erro'     => 'Erro ao acessar SAP Service Layer',
                     'status'   => $response->status(),
                     'resposta' => $response->body()
                 ], $response->status());
             }

             // Obter a lista de projetos da chave "value"
             $projetos = $response->json()['value'] ?? [];

             // Filtrar os projetos de acordo com o termo (ignorando maiúsculas/minúsculas)
             $projetosFiltrados = collect($projetos)->filter(function ($projeto) use ($termo) {
                 return str_contains(strtolower($projeto['Code']), strtolower($termo)) ||
                        str_contains(strtolower($projeto['Name']), strtolower($termo));
             })->values();

             // Mapear para o formato que o frontend espera, usando o Code como fallback se Name for nulo
             $resultado = $projetosFiltrados->map(function ($p) {
                 return [
                     'codigo' => $p['Code'],
                     'nome'   => $p['Name'] ?? $p['Code'],
                 ];
             });

             return response()->json($resultado);

         } catch (\Exception $e) {
             return response()->json(['erro' => 'Erro na requisição: ' . $e->getMessage()], 500);
         }
     }
 }
