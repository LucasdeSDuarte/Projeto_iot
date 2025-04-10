<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SensorResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'tipo'          => $this->tipo,
            'unidade'       => $this->unidade,
            'identificador' => $this->identificador,
            'ativo'         => $this->ativo,
            'appliance_id'  => $this->appliance_id,
            'appliance'     => $this->whenLoaded('appliance', function () {
                return [
                    'id'   => $this->appliance->id,
                    'nome' => $this->appliance->nome,
                ];
            }),
        ];
    }
}
