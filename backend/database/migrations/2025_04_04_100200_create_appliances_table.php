<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppliancesTable extends Migration
{
    public function up()
    {
        Schema::create('appliances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('torre_id');
            $table->string('nome');
            $table->string('tipo');
            $table->string('descricao')->nullable();
            $table->string('rota')->nullable();
            $table->boolean('ativo')->default(true);
            $table->timestamps();

            // Defina a foreign key se necessário:
            $table->foreign('torre_id')->references('id')->on('torres');
        });
    }

    public function down()
    {
        Schema::dropIfExists('appliances');
    }
}
