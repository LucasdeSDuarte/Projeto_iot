<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ApplianceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id'         => $this->id,
            'torre_id'   => $this->torre_id,
            'nome'       => $this->nome,
            'tipo'       => $this->tipo,
            'descricao'  => $this->descricao,
            'rota'       => $this->rota,
            'ativo'      => $this->ativo,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),

            // Cliente associado via torre
            'cliente_id' => optional($this->torre->cliente)->id,
            'cliente_nome' => optional($this->torre->cliente)->nome,

            // Torre associada
            'torre' => $this->whenLoaded('torre', function () {
                return [
                    'id'      => $this->torre->id,
                    'nome'    => $this->torre->nome,
                    'projeto' => $this->torre->projeto,
                ];
            }),

            // Sensores vinculados
            'sensors' => SensorResource::collection($this->whenLoaded('sensors')),
        ];
    }
}
