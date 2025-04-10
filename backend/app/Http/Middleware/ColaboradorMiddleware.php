<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ColaboradorFake;

class ColaboradorMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof ColaboradorFake) {
            return response()->json(['error' => 'Acesso restrito a colaboradores'], 403);
        }

        return $next($request);
    }
}

