<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AlarmeResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'             => $this->id,
            'descricao'      => $this->descricao,
            'valor_alarme'   => $this->valor_alarme,
            'email'          => $this->email,
            'ativo'          => $this->ativo,
            'sensor_id'      => $this->sensor_id,

            // Informações do sensor
            'sensor' => [
                'id'          => $this->sensor->id ?? null,
                'tipo'        => $this->sensor->tipo ?? null,
                'unidade'     => $this->sensor->unidade ?? null,
                'identificador' => $this->sensor->identificador ?? null,

                // Informações do dispositivo (appliance)
                'appliance' => [
                    'id'       => $this->sensor->appliance->id ?? null,
                    'nome'     => $this->sensor->appliance->nome ?? null,
                    'tipo'     => $this->sensor->appliance->tipo ?? null,
                ],
            ],
        ];
    }
}
