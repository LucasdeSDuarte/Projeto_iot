<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAlarmesTable extends Migration
{
    public function up(): void
    {
        Schema::create('alarmes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sensor_id')->constrained('sensores')->onDelete('cascade');
            $table->string('descricao'); // ex: Temperatura Média
            $table->decimal('valor_alarme', 8, 2); // ex: 28.5
            $table->string('email'); // email destino do alerta
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alarmes');
    }
};
