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
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['reimbursement', 'advance', 'bill']);
            $table->enum('category', [
                'biaya allowance',
                'biaya gaji',
                'biaya komisi',
                'biaya sewa',
                'biaya utilitas',
                'biaya service charge',
                'biaya operasional',
                'biaya promosi',
                'biaya reward',
                'biaya pajak',
                'biaya bpjs',
                'biaya lainya'
            ]);
            $table->string('title', 255);

            $table->double('amount')->default(0);
            $table->double('actual_amount')->default(0);

            $table->enum('status', ['draft', 
            'submitted', 
            'head_approved', 
            'director_approved', 
            'rejected', 'paid', 
            'refunded'])->default('draft');

            $table->boolean('is_closed')->default(false);
            $table->enum('payment_method', ['cash', 'transfer']);
            $table->json('attachments')->nullable();
            $table->date('head_approved_at')->nullable();
            $table->date('head_approved_by')->nullable();
            $table->date('director_approved_at')->nullable();
            $table->date('director_approved_by')->nullable();
            $table->date('paid_at')->nullable();
            $table->date('paid_by')->nullable();
            $table->string('rejected_reason')->nullable();
            $table->timestamps();
        });

        Schema::create('request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained()->cascadeOnDelete();
            $table->text('description');
            $table->double('amount');
            $table->double('actual_amount')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
        Schema::dropIfExists('request_items');
    }
};
