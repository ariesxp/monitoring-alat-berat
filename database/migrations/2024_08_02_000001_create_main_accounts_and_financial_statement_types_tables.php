<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

        // Seed unique main_accounts from existing data
        $mainAccounts = DB::table('accounts')->select('main_account')->distinct()->pluck('main_account');
        foreach ($mainAccounts as $name) {
            if ($name) {
                DB::table('main_accounts')->insert([
                    'code' => strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($name)), 0, 20)),
                    'name' => $name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Seed unique financial_statement_types from existing data
        $types = DB::table('accounts')->select('financial_statement_type')->distinct()->pluck('financial_statement_type');
        foreach ($types as $name) {
            if ($name) {
                DB::table('financial_statement_types')->insert([
                    'code' => strtoupper(substr(preg_replace('/[^A-Z0-9 \/]/', '', $name), 0, 30)),
                    'name' => $name,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // Add FK columns to accounts
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreignId('main_account_id')->nullable()->after('account_description')->constrained('main_accounts')->restrictOnDelete();
            $table->foreignId('financial_statement_type_id')->nullable()->after('account_type')->constrained('financial_statement_types')->restrictOnDelete();
        });

        // Migrate existing data to FKs
        $accounts = DB::table('accounts')->get();
        foreach ($accounts as $account) {
            $mainAccountId = DB::table('main_accounts')->where('name', $account->main_account)->value('id');
            $fstId = DB::table('financial_statement_types')->where('name', $account->financial_statement_type)->value('id');

            DB::table('accounts')->where('id', $account->id)->update([
                'main_account_id' => $mainAccountId,
                'financial_statement_type_id' => $fstId,
            ]);
        }

        // Drop old columns
        Schema::table('accounts', function (Blueprint $table) {
            $table->dropColumn(['main_account', 'financial_statement_type']);
        });

        // Make FK columns non-nullable
        Schema::table('accounts', function (Blueprint $table) {
            $table->foreignId('main_account_id')->nullable(false)->change();
            $table->foreignId('financial_statement_type_id')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->string('main_account')->after('account_description');
            $table->string('financial_statement_type')->after('account_type');
        });

        $accounts = DB::table('accounts')
            ->join('main_accounts', 'accounts.main_account_id', '=', 'main_accounts.id')
            ->join('financial_statement_types', 'accounts.financial_statement_type_id', '=', 'financial_statement_types.id')
            ->select('accounts.id', 'main_accounts.name as ma_name', 'financial_statement_types.name as fst_name')
            ->get();

        foreach ($accounts as $account) {
            DB::table('accounts')->where('id', $account->id)->update([
                'main_account' => $account->ma_name,
                'financial_statement_type' => $account->fst_name,
            ]);
        }

        Schema::table('accounts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('main_account_id');
            $table->dropConstrainedForeignId('financial_statement_type_id');
        });

        Schema::dropIfExists('financial_statement_types');
        Schema::dropIfExists('main_accounts');
    }
};
