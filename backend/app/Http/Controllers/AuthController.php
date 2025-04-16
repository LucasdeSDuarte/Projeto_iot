<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use App\Models\Cliente;
use App\Models\ColaboradorFake;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validação dos campos
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'senha' => 'required|string',
            'g-recaptcha-response' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $login = $request->login;
        $senha = $request->senha;
        $recaptchaToken = $request->input('g-recaptcha-response');

        // 2. Validação do reCAPTCHA
        $verify = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => config('services.recaptcha.secret'),
            'response' => $recaptchaToken,
            'remoteip' => $request->ip(),
        ]);

        $verifyData = $verify->json();

        if (!($verifyData['success'] ?? false)) {
            return response()->json(['error' => 'Falha na verificação do reCAPTCHA'], 400);
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Autenticação do colaborador (banco externo)
        |--------------------------------------------------------------------------
        */
        try {
            $colaborador = DB::connection('external')->table('users')
                ->where('Usuario', $login)
                ->where(function ($query) {
                    $query->where('asddsa', 1)
                          ->orWhere('TITOOLSTI', 1);
                })
                ->first();

            if ($colaborador && Hash::check($senha, $colaborador->Senha)) {
                $fakeUser = new ColaboradorFake([
                    'id' => $colaborador->id,
                    'name' => $colaborador->Nome,
                ]);

                // Evita que tente fazer INSERT
                $fakeUser->exists = true;

                // Criação do token
                $token = $fakeUser->createToken('colaborador-token')->plainTextToken;

                return response()->json([
                    'status' => 'success',
                    'tipo' => 'colaborador',
                    'token' => $token,
                    'nome' => $colaborador->Nome,
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao consultar banco externo',
                'mensagem' => $e->getMessage(),
            ], 500);
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Autenticação do cliente (banco local)
        |--------------------------------------------------------------------------
        */
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

        /*
        |--------------------------------------------------------------------------
        | 5. Falha geral de autenticação
        |--------------------------------------------------------------------------
        */
        return response()->json([
            'error' => 'Colaborador sem permissão ou senha inválida'
        ], 401);
    }
}
