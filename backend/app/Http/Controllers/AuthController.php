<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Models\Cliente;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validação dos campos
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'senha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $login = $request->login;
        $senha = $request->senha;

        // 2. Verifica se é colaborador da empresa (tabela externa)
        try {
            $colaborador = DB::connection('external')->table('users')
                ->where('Usuario', $login)
                ->where(function ($query) {
                    $query->where('IoTAdm', 1)
                          ->orWhere('IoTComum', 1);
                })
                ->first();
                if ($colaborador && Hash::check($senha, $colaborador->Senha)) {
                    $fakeUser = new \App\Models\ColaboradorFake([
                        'id' => $colaborador->id ?? 0,
                        'name' => $colaborador->Nome ?? 'Colaborador',
                    ]);
                
                    $token = $fakeUser->createToken('colaborador-token')->plainTextToken;
                
                    return response()->json([
                        'status' => 'success',
                        'tipo' => 'colaborador',
                        'token' => $token,
                        'nome' => $colaborador->Nome,
                    ]);
                }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao consultar banco externo'], 500);
        }

        // 3. Verifica se é cliente (banco local, sem hash por enquanto)
        $cliente = Cliente::where('login', $login)->first();
        if ($cliente && Hash::check($senha, $cliente->senha)) {

            $token = $cliente->createToken('cliente-token')->plainTextToken;

            return response()->json([
                'status' => 'success',
                'tipo' => 'cliente',
                'token' => $token,
                'cliente_id' => $cliente->id,
                'nome' => $cliente->nome
            ]);
        }

        return response()->json(['error' => 'Colaborador sem permissão ou senha inválida'], 401);

    }
}
