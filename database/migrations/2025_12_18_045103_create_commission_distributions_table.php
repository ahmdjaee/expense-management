<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commission_distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commission_layer_id')->constrained('commission_layers')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('login_code');
            $table->integer('deal_id');
            $table->string('symbol');
            $table->decimal('lot_size', 10, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->timestamp('deal_time');
            $table->timestamps();

            // Index untuk performa query
            $table->index(['user_id', 'deal_time']);
            $table->index(['login_code', 'deal_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commission_distributions');
    }
};
