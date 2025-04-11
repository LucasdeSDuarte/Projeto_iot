<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\TorreController;
use App\Http\Controllers\ApplianceController;
use App\Http\Controllers\SensorController;
use App\Http\Controllers\AlarmeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TopologiaController;
use App\Http\Controllers\SAPProjectController;
use App\Http\Controllers\SAPClientController;


/*
|--------------------------------------------------------------------------
| Rotas Públicas (Sem Autenticação)
|--------------------------------------------------------------------------
*/

// Se desejar manter a rota de login, mantenha-a; caso contrário, remova-a.
Route::post('/login', [AuthController::class, 'login']);

// Rotas dos Clientes
Route::get('/clientes', [ClienteController::class, 'index']);
Route::post('/clientes', [ClienteController::class, 'store']);
Route::put('/clientes/{cliente}', [ClienteController::class, 'update']);
// Você pode incluir o DELETE se necessário:
// Route::delete('/clientes/{cliente}', [ClienteController::class, 'destroy']);

// Rotas de Torres
Route::get('/torres', [TorreController::class, 'index']);
Route::post('/torres', [TorreController::class, 'store']);
Route::put('/torres/{torre}', [TorreController::class, 'update']);
Route::delete('/torres/{torre}', [TorreController::class, 'destroy']);
Route::get('/projetos', function () {
    $projetos = \App\Models\Torre::whereNotNull('projeto')
        ->distinct()
        ->orderBy('projeto')
        ->pluck('projeto');

    return response()->json($projetos);
});


// Rotas de Appliances
Route::get('/appliances', [ApplianceController::class, 'index']);
Route::post('/appliances', [ApplianceController::class, 'store']);
Route::put('/appliances/{appliance}', [ApplianceController::class, 'update']);
Route::delete('/appliances/{appliance}', [ApplianceController::class, 'destroy']);

// Rotas de Sensores
Route::get('/sensores', [SensorController::class, 'index']);
Route::post('/sensores', [SensorController::class, 'store']);
Route::put('/sensores/{sensor}', [SensorController::class, 'update']);
Route::delete('/sensores/{sensor}', [SensorController::class, 'destroy']);

// Rotas de Alarmes
Route::get('/alarmes', [AlarmeController::class, 'index']);
Route::post('/alarmes', [AlarmeController::class, 'store']);
Route::put('/alarmes/{alarme}', [AlarmeController::class, 'update']);
Route::delete('/alarmes/{alarme}', [AlarmeController::class, 'destroy']);


// Rotas do Dashboard Colaborador
Route::get('/dashboard/indicadores', [DashboardController::class, 'indicadores']);

// Rotas de topologia

Route::get('/topologia', [TopologiaController::class, 'index']);

// Rotas de Autenticação SAP e Operações
Route::get('/sap/projects', [SAPProjectController::class, 'listarProjetos']);
Route::get('/sap/clients', [SAPClientController::class, 'listarPNClientes']);



/*
|--------------------------------------------------------------------------
| Rota Fallback
|--------------------------------------------------------------------------
|
| Essa rota será acionada para URLs que não tiverem correspondência.
|
*/
Route::fallback(function () {
    Log::warning('Rota não encontrada.', [
        'rota_tentada' => request()->fullUrl(),
        'metodo'       => request()->method(),
    ]);

    return response()->json(['error' => 'Rota não encontrada.'], 404);
});
