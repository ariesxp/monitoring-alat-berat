<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->string('sender', 20);
            $table->string('sender_name')->nullable();
            $table->text('message');
            $table->string('device', 50)->nullable();
            $table->enum('direction', ['incoming', 'outgoing'])->default('incoming');
            $table->string('parsed_command', 100)->nullable();
            $table->json('parsed_data')->nullable();
            $table->enum('processing_status', ['received', 'parsed', 'processed', 'failed', 'ignored'])->default('received');
            $table->text('error_message')->nullable();
            $table->string('related_model_type')->nullable();
            $table->unsignedBigInteger('related_model_id')->nullable();
            $table->timestamps();

            $table->index(['sender', 'created_at']);
        });

        Schema::create('whatsapp_registered_numbers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('operator_id')->nullable()->constrained('operators')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('phone_number', 20)->unique();
            $table->boolean('is_active')->default(true);
            $table->boolean('can_input_laporan')->default(false);
            $table->boolean('can_input_absensi')->default(false);
            $table->boolean('can_input_penerimaan')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_registered_numbers');
        Schema::dropIfExists('whatsapp_messages');
    }
};
