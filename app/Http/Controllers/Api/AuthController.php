<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login memakai username ATAU email + password (akun tabel users).
     * Mengembalikan token Bearer untuk dipakai request berikutnya.
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'device'   => 'nullable|string',
        ]);

        $login = trim($data['username']);

        $user = User::where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Username atau password salah.'],
            ]);
        }

        if ($user->is_active === false) {
            throw ValidationException::withMessages([
                'username' => ['Akun tidak aktif. Hubungi administrator.'],
            ]);
        }

        $token = ApiToken::issue($user, $data['device'] ?? null);

        return response()->json([
            'token' => $token->token,
            'user'  => $this->userPayload($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->userPayload($request->user())]);
    }

    public function logout(Request $request)
    {
        $current = $request->attributes->get('current_api_token');
        if ($current instanceof ApiToken) {
            $current->delete();
        }

        return response()->json(['message' => 'Logout berhasil.']);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:5|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama salah.'],
            ]);
        }

        $user->forceFill(['password' => Hash::make($data['new_password'])])->save();

        // Cabut token lain agar sesi lama tidak dipakai; sisakan token aktif.
        $current = $request->attributes->get('current_api_token');
        $user->apiTokens()->when($current, fn ($q) => $q->where('id', '!=', $current->id))->delete();

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    protected function userPayload(User $user): array
    {
        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'role'     => $user->role,
            'phone'    => $user->phone,
        ];
    }
}
