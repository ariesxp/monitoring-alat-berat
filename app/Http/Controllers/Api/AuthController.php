<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\Operator;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login aplikasi.
     *
     * Dua jalur autentikasi:
     *  1) Akun tabel `users` (username/email + password) — mis. supervisor.
     *  2) Operator/karyawan: username = NIK (nik_karyawan, fallback nik) +
     *     password pada tabel `operators`. Kredensial ini SAMA dengan yang
     *     dipakai aplikasi monitoring (backend PHP aobsystem.com) karena
     *     keduanya bersumber dari monitoring_alat_berat.operators.password.
     *
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

        // --- Jalur 1: akun users (username/email) ---
        $user = User::where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if ($user && Hash::check($data['password'], $user->password)) {
            if ($user->is_active === false) {
                throw ValidationException::withMessages([
                    'username' => ['Akun tidak aktif. Hubungi administrator.'],
                ]);
            }

            return $this->issueFor($user, $data['device'] ?? null);
        }

        // --- Jalur 2: operator via NIK + operators.password ---
        $operator = Operator::whereRaw("COALESCE(NULLIF(nik_karyawan, ''), nik) = ?", [$login])->first();

        if ($operator && !empty($operator->password) && Hash::check($data['password'], $operator->password)) {
            $user = $this->userForOperator($operator);
            return $this->issueFor($user, $data['device'] ?? null);
        }

        throw ValidationException::withMessages([
            'username' => ['NIK/username atau password salah.'],
        ]);
    }

    /** Terbitkan token Bearer untuk user. */
    protected function issueFor(User $user, ?string $device)
    {
        $token = ApiToken::issue($user, $device);

        return response()->json([
            'token' => $token->token,
            'user'  => $this->userPayload($user),
        ]);
    }

    /**
     * Pastikan operator memiliki akun `users` tertaut (untuk pembawa token
     * & relasi user->operator). Dibuat/di-link otomatis bila belum ada.
     */
    protected function userForOperator(Operator $operator): User
    {
        if ($operator->user) {
            return $operator->user;
        }

        $nik = $operator->nik_karyawan ?: $operator->nik;

        $user = User::firstOrCreate(
            ['username' => $nik],
            [
                'name'      => $operator->nama,
                'email'     => 'op-' . $operator->id . '@aobsystem.local',
                'password'  => $operator->password, // sudah berupa hash bcrypt
                'role'      => 'operator',
                'is_active' => true,
            ]
        );

        $operator->forceFill(['user_id' => $user->id])->save();

        return $user;
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
        $operator = $user->operator;

        return [
            'id'       => $user->id,
            'name'     => $user->name,
            'username' => $user->username,
            'email'    => $user->email,
            'role'     => $user->role,
            'phone'    => $user->phone,
            'is_supervisor' => in_array($user->role, ['supervisor', 'admin'], true),
            'operator' => $operator ? [
                'id'      => $operator->id,
                'nama'    => $operator->nama,
                'nik'     => $operator->nik_karyawan ?: $operator->nik,
                'jabatan' => $operator->jabatan,
                'foto'    => $operator->foto ? asset('storage/' . $operator->foto) : null,
            ] : null,
        ];
    }
}
