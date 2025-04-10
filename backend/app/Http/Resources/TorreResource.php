<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TorreResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'localizacao' => $this->localizacao,
            // Retorne os dados do cliente de forma controlada
            'cliente' => new ClienteResource($this->whenLoaded('cliente')),
            // Caso deseje incluir dispositivos (appliances) com seus sensores e alarmes, faça assim:
            'appliances' => ApplianceResource::collection($this->whenLoaded('appliances')),
        ];
    }
}
