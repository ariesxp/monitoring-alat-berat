<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petty_cash', function (Blueprint $table) {
            $table->id();
            $table->date('posting_date');
            $table->string('voucher_number', 50)->unique();
            $table->string('description');
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->text('remark')->nullable();
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash');
    }
};
