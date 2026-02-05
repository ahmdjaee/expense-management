<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // LPJ fields
            $table->string('lpj_attachment')->nullable()->after('attachments');
            $table->text('lpj_notes')->nullable()->after('lpj_attachment');
            $table->timestamp('lpj_submitted_at')->nullable()->after('lpj_notes');
            $table->timestamp('lpj_verified_at')->nullable()->after('lpj_submitted_at');
            $table->foreignId('lpj_verified_by')->nullable()->after('lpj_verified_at');
            $table->text('lpj_verification_notes')->nullable()->after('lpj_verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn([
                'actual_amount',
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