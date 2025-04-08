<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // <- ESSENCIAL para ativar as rotas da API!
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function () {
        return [
            'cliente' => \App\Http\Middleware\ClienteMiddleware::class,
            'colaborador' => \App\Http\Middleware\ColaboradorMiddleware::class,
        ];
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Pode configurar tratamento customizado de erros aqui, se necessário
    })
    ->create();
