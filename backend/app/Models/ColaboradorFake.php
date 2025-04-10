<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class ColaboradorFake extends Authenticatable
{
    use HasApiTokens;
    protected $hidden = ['tokens'];
    protected $fillable = ['id', 'name'];

    public $timestamps = false;
    public $incrementing = false;
    protected $keyType = 'int';
    protected $primaryKey = 'id';

    protected $table = 'users';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);
        $this->exists = true; // Impede INSERT
    }
}

