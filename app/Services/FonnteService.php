<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    public function sendMessage(string $target, string $message): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => config('fonnte.token'),
            ])->post(config('fonnte.api_url'), [
                'target' => $target,
                'message' => $message,
            ]);

            return $response->json() ?? ['status' => false];
        } catch (\Exception $e) {
            Log::error('Fonnte send error: ' . $e->getMessage());
            return ['status' => false, 'reason' => $e->getMessage()];
        }
    }
}
