<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\TorreController;


Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logout realizado com sucesso']);
    });

    Route::middleware('cliente')->get('/cliente/dashboard', function () {
        return response()->json(['msg' => 'Painel do cliente']);
    });

    Route::middleware('colaborador')->get('/admin/dashboard', function () {
        return response()->json(['msg' => 'Painel do colaborador']);
    });
});
Route::middleware('auth:sanctum')->get('/cliente/info', function (Request $request) {
    return response()->json([
        'cliente_id' => $request->user()->id,
        'nome' => $request->user()->nome,
        'email' => $request->user()->email,
    ]);
});

//Clientes
Route::get('/clientes', [ClienteController::class, 'index']);
Route::post('/clientes', [ClienteController::class, 'store']);
Route::put('/clientes/{cliente}', [ClienteController::class, 'update']);

//Torres

Route::middleware('auth:sanctum')->group(function () {
    // Listar torres
    Route::get('/torres', [TorreController::class, 'index']);
    
    // Cadastrar nova torre
    Route::post('/torres', [TorreController::class, 'store']);
    
    // Atualizar torre
    Route::put('/torres/{torre}', [TorreController::class, 'update']);
    
    // Excluir torre
    Route::delete('/torres/{torre}', [TorreController::class, 'destroy']);
});


