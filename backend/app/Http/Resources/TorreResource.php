<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TorreResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id'          => $this->id,
            'nome'        => $this->nome,
            'localizacao' => $this->localizacao,
            'projeto'     => $this->projeto,
            'ativo'       => $this->ativo,
            'cliente_id'  => $this->cliente_id,
            'cliente'     => $this->whenLoaded('cliente'),
            'appliances'  => ApplianceResource::collection($this->whenLoaded('appliances')),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
