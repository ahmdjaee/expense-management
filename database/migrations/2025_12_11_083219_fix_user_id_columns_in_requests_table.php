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
        Schema::table('requests', function (Blueprint $table) {
            // Ubah tipe data kolom-kolom ini menjadi unsigned big integer
            $table->unsignedBigInteger('head_approved_by')->nullable()->change();
            $table->unsignedBigInteger('director_approved_by')->nullable()->change();
            $table->unsignedBigInteger('paid_by')->nullable()->change();
            $table->unsignedBigInteger('user_id')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Kembalikan ke tipe semula (sesuaikan jika perlu)
            $table->string('head_approved_by')->nullable()->change();
            $table->string('director_approved_by')->nullable()->change();
            $table->string('paid_by')->nullable()->change();
            $table->string('user_id')->change();
        });
    }
};