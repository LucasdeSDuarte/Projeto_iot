<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray($request)
    {
        return [
 'id' => $this->id,
            'nome' => $this->nome,
            'login' => $this->login,
            'email' => $this->email,
            'ativo' => $this->ativo,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
