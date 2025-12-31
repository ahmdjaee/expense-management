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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id');
            $table->enum('type', ['reimbursement', 'advance']);
            $table->enum('category', ['travel', 'office_supplies', 'entertainment', 'utilities', 'other']);
            $table->double('amount');
            $table->string('title', 255);
            $table->text('description');
            $table->enum('status', ['draft', 'submitted', 'head_approved', 'director_approved', 'rejected', 'closed', 'paid'])->default('draft');
            $table->enum('payment_method', ['cash', 'transfer']);
            $table->string('attachment', 255)->nullable();
            $table->date('head_approved_at')->nullable();
            $table->date('head_approved_by')->nullable();
            $table->date('director_approved_at')->nullable();
            $table->date('director_approved_by')->nullable();
            $table->date('paid_at')->nullable();
            $table->date('paid_by')->nullable();
            $table->string('rejected_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};
