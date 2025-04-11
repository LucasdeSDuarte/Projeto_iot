<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenRequisicao extends Model
{
    protected $connection = 'requisicao'; // usa a nova conexão
    protected $table = 'tokens'; // nome da tabela
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'instancia',
        'session_id',
        'version',
        'expiration_date',
        'session_timeout',
    ];

    /**
     * Retorna o session_id disponível.
     * Você pode ajustar esta lógica, por exemplo, forçando uma instância padrão.
     */
    public static function getSessionId()
    {
        // Se desejar forçar uma instância padrão, descomente a linha abaixo:
        // return self::where('instancia', 'SBO_ALPINA_TST')->value('session_id');

        // Caso contrário, retorna o session_id do primeiro token disponível
        return self::value('session_id');
    }
}
