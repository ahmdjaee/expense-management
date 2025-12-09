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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('position' , ['head', 'karyawan', 'direktur', 'finance', 'direksi'])->nullable()->after('role');
            $table->string('phone')->nullable()->after('position');
            $table->string('address')->nullable()->after('phone');
            $table->string('rekening')->nullable()->after('address');
            $table->string('bank')->nullable()->after('rekening');
            $table->string('rekening_name')->nullable()->after('bank');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
