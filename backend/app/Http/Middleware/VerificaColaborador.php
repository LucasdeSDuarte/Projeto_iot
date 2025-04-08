<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class VerificaColaborador
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        $isColaborador = $user instanceof \App\Models\ColaboradorFake;

        if (!$isColaborador) {
            return response()->json(['message' => 'Acesso restrito a colaboradores'], 403);
        }

        return $next($request);
    }
}
