<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Cliente;

class ClienteMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() instanceof Cliente) {
            return response()->json(['error' => 'Acesso restrito a clientes'], 403);
        }

        return $next($request);
    }
}
