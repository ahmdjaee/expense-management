<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('commission_distributions', function (Blueprint $table) {
            // Ubah kolom deal_id dari integer menjadi bigInteger
            $table->bigInteger('deal_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_distributions', function (Blueprint $table) {
            // Kembalikan ke integer jika rollback
            $table->integer('deal_id')->change();
        });
    }
};