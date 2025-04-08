<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClienteMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user_type !== 'cliente') {
            return response()->json(['error' => 'Acesso restrito a clientes'], 403);
        }

        return $next($request);
    }
}
