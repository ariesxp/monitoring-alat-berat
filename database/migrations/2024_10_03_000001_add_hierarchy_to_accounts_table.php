<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambah kolom hierarki (parent-anak) + level (jenjang)
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('account_description')
                ->constrained('accounts')->nullOnDelete();
            $table->unsignedTinyInteger('level')->default(3)->after('parent_id');
        });

        // 2. Header (mis. 1000 ASSETS) & grup (mis. 1100 Current Assets) tidak punya
        //    main account / tipe laporan keuangan, jadi kedua FK dijadikan nullable.
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['main_account_id']);
            $table->dropForeign(['financial_statement_type_id']);
        });
        Schema::table('accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('main_account_id')->nullable()->change();
            $table->unsignedBigInteger('financial_statement_type_id')->nullable()->change();
        });
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreign('main_account_id')->references('id')->on('main_accounts')->restrictOnDelete();
            $table->foreign('financial_statement_type_id')->references('id')->on('financial_statement_types')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'level']);
        });

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropForeign(['main_account_id']);
            $table->dropForeign(['financial_statement_type_id']);
        });
        Schema::table('accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('main_account_id')->nullable(false)->change();
            $table->unsignedBigInteger('financial_statement_type_id')->nullable(false)->change();
        });
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreign('main_account_id')->references('id')->on('main_accounts')->restrictOnDelete();
            $table->foreign('financial_statement_type_id')->references('id')->on('financial_statement_types')->restrictOnDelete();
        });
    }
};
