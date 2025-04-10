<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTorresTable extends Migration
{
    public function up()
    {
        Schema::create('torres', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cliente_id');
            $table->string('nome');
            $table->string('localizacao');
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            // Defina a foreign key se necessário:
            $table->foreign('cliente_id')->references('id')->on('clientes');
        });
    }

    public function down()
    {
        Schema::dropIfExists('torres');
    }
}
