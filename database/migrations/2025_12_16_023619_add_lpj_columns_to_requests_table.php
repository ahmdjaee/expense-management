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
            // Tambahkan kolom-kolom LPJ jika belum ada
            if (!Schema::hasColumn('requests', 'lpj_attachment')) {
                $table->string('lpj_attachment')->nullable();
            }

            if (!Schema::hasColumn('requests', 'lpj_notes')) {
                $table->text('lpj_notes')->nullable();
            }

            if (!Schema::hasColumn('requests', 'lpj_submitted_at')) {
                $table->timestamp('lpj_submitted_at')->nullable();
            }

            if (!Schema::hasColumn('requests', 'lpj_verified_at')) {
                $table->timestamp('lpj_verified_at')->nullable();
            }

            if (!Schema::hasColumn('requests', 'lpj_verified_by')) {
                $table->unsignedBigInteger('lpj_verified_by')->nullable();
            }

            if (!Schema::hasColumn('requests', 'lpj_verification_notes')) {
                $table->text('lpj_verification_notes')->nullable();
            }

            // Tambahkan foreign key constraint untuk lpj_verified_by
            if (Schema::hasColumn('requests', 'lpj_verified_by')) {
                $table->foreign('lpj_verified_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Hapus foreign key constraint jika ada
            if (Schema::hasColumn('requests', 'lpj_verified_by')) {
                $table->dropForeign(['lpj_verified_by']);
            }

            // Hapus kolom-kolom LPJ
            $table->dropColumn([
                'lpj_attachment',
                'lpj_notes',
                'lpj_submitted_at',
                'lpj_verified_at',
                'lpj_verified_by',
                'lpj_verification_notes'
            ]);
        });
    }
};