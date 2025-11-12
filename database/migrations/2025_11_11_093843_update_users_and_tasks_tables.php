<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Cek dan tambah is_personal ke tasks jika belum ada
        if (!Schema::hasColumn('tasks', 'is_personal')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->boolean('is_personal')->default(false);
            });
        }

    }

    public function down()
    {
        // Tidak perlu down method untuk perubahan struktural
    }
};