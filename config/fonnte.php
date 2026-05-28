<?php

return [
    'api_url' => env('FONNTE_API_URL', 'https://api.fonnte.com/send'),
    'token' => env('FONNTE_API_TOKEN'),
    'device' => env('FONNTE_DEVICE_ID'),
    'webhook_secret' => env('FONNTE_WEBHOOK_SECRET'),
];
