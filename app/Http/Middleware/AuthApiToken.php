<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Memvalidasi header "Authorization: Bearer <token>" terhadap tabel api_tokens.
 * Bila valid, user terkait di-set sebagai user aktif request (auth()->user()).
 */
class AuthApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil token dari header Authorization; fallback ke query ?token=
        // agar tautan unduhan file (mis. ekspor Excel/PDF) bisa langsung dibuka.
        $bearer = $request->bearerToken() ?: $request->query('token');

        if (!$bearer) {
            return response()->json(['message' => 'Token tidak ditemukan.'], 401);
        }

        $apiToken = ApiToken::with('user')->where('token', $bearer)->first();

        if (!$apiToken || !$apiToken->user) {
            return response()->json(['message' => 'Token tidak valid.'], 401);
        }

        if (property_exists($apiToken->user, 'is_active') || isset($apiToken->user->is_active)) {
            if ($apiToken->user->is_active === false) {
                return response()->json(['message' => 'Akun tidak aktif.'], 403);
            }
        }

        $apiToken->forceFill(['last_used_at' => now()])->saveQuietly();

        // Set user aktif untuk request ini (guard default & helper auth()).
        $request->setUserResolver(fn () => $apiToken->user);
        auth()->setUser($apiToken->user);

        // Simpan token aktif agar bisa dihapus saat logout.
        $request->attributes->set('current_api_token', $apiToken);

        return $next($request);
    }
}
