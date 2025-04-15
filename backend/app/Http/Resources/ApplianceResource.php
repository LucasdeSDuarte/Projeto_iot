<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApplianceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'nome'       => $this->nome,
            'tipo'       => $this->tipo,
            'descricao'  => $this->descricao,
            'rota'       => $this->rota,
            'ativo'      => $this->ativo,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // cliente_id usado no frontend para selecionar cliente atual
            'cliente_id' => optional($this->torre->cliente)->id,

            // Torre associada
            'torre' => $this->whenLoaded('torre', function () {
                return [
                    'id'   => $this->torre->id,
                    'nome' => $this->torre->nome,
                ];
            }),

            // Sensores vinculados (se usados)
            'sensors' => SensorResource::collection($this->whenLoaded('sensors')),
        ];
    }

}
