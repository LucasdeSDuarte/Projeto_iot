<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppliancesTable extends Migration
{
    public function up(): void
    {
        Schema::create('appliances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torre_id')->constrained('torres')->onDelete('cascade');
            $table->string('nome');
            $table->string('tipo');
            $table->text('descricao')->nullable();
            $table->string('rota')->nullable(); // nova coluna para acesso remoto
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appliances');
    }
};
