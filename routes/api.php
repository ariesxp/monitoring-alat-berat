<?php

use Illuminate\Support\Facades\Route;

Route::post('/webhook/fonnte', [\App\Http\Controllers\Api\WhatsappWebhookController::class, 'handle'])
    ->name('webhook.fonnte');
