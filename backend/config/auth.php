<?php

return [

    'defaults' => [
        'guard' => 'web',
        'passwords' => 'users',
    ],

'guards' => [
    'api' => [
        'driver' => 'sanctum',
        'provider' => 'colaboradores',
    ],
    'cliente' => [
        'driver' => 'sanctum',
        'provider' => 'clientes',
    ],
],


    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model' => App\Models\User::class,
        ],

        'clientes' => [
            'driver' => 'eloquent',
            'model' => App\Models\Cliente::class,
        ],

        'colaboradores' => [
            'driver' => 'eloquent',
            'model' => App\Models\ColaboradorFake::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => 'password_reset_tokens',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];
