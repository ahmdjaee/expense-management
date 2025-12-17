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
        // Update login_codes table - remove user_id and unique constraint on code
        Schema::table('login_codes', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
            $table->dropUnique(['code']);
        });

        // Create pivot table for many-to-many relationship
        Schema::create('login_code_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('login_code_id')->constrained('login_codes')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            // Ensure unique combination of login_code_id and user_id
            $table->unique(['login_code_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_code_user');

        Schema::table('login_codes', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->unique('code');
        });
    }
};