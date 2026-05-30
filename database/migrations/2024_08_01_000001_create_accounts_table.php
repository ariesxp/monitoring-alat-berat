<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('main_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('financial_statement_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_number', 20)->unique();
            $table->string('account_description')->nullable();
            $table->foreignId('main_account_id')->constrained('main_accounts')->restrictOnDelete();
            $table->enum('account_type', ['Sale', 'Cost', 'Activa', 'Pasiva', 'Expense'])->nullable();
            $table->foreignId('financial_statement_type_id')->constrained('financial_statement_types')->restrictOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');
        Schema::dropIfExists('financial_statement_types');
        Schema::dropIfExists('main_accounts');
    }
};
