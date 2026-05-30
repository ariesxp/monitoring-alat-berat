<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petty_cash_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_id')->constrained('petty_cash')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->string('description');
            $table->text('remark')->nullable();
            $table->decimal('debit', 15, 2)->default(0);
            $table->decimal('credit', 15, 2)->default(0);
            $table->timestamps();
        });

        // Migrate existing rows into details
        $rows = DB::table('petty_cash')->get();
        foreach ($rows as $row) {
            DB::table('petty_cash_details')->insert([
                'petty_cash_id' => $row->id,
                'account_id' => $row->account_id,
                'description' => $row->description,
                'remark' => $row->remark,
                'debit' => $row->debit,
                'credit' => $row->credit,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);
        }

        // Drop old columns from header
        Schema::table('petty_cash', function (Blueprint $table) {
            $table->dropForeign(['account_id']);
            $table->dropColumn(['account_id', 'debit', 'credit']);
        });
    }

    public function down(): void
    {
        Schema::table('petty_cash', function (Blueprint $table) {
            $table->foreignId('account_id')->nullable()->after('description')->constrained('accounts')->restrictOnDelete();
            $table->decimal('debit', 15, 2)->default(0)->after('remark');
            $table->decimal('credit', 15, 2)->default(0)->after('debit');
        });

        $details = DB::table('petty_cash_details')
            ->select('petty_cash_id', 'account_id', 'debit', 'credit')
            ->get()
            ->groupBy('petty_cash_id');

        foreach ($details as $pcId => $items) {
            $first = $items->first();
            DB::table('petty_cash')->where('id', $pcId)->update([
                'account_id' => $first->account_id,
                'debit' => $items->sum('debit'),
                'credit' => $items->sum('credit'),
            ]);
        }

        Schema::dropIfExists('petty_cash_details');
    }
};
