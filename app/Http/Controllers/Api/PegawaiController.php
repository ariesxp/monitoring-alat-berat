<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Operator;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PegawaiController extends Controller
{
    /** GET /pegawai — Daftar karyawan + status kehadiran hari ini. */
    public function index(Request $request)
    {
        $office = Geo::officeConfig();
        $today = now()->toDateString();

        $absensi = Absensi::whereDate('tanggal', $today)->get()->keyBy('operator_id');

        $operators = Operator::aktif()
            ->when($request->get('search'), function ($q) use ($request) {
                $s = $request->get('search');
                $q->where(fn ($qq) => $qq->where('nama', 'like', "%{$s}%")
                    ->orWhere('nik', 'like', "%{$s}%")
                    ->orWhere('jabatan', 'like', "%{$s}%"));
            })
            ->orderBy('nama')
            ->get()
            ->map(function (Operator $op) use ($absensi, $office) {
                $a = $absensi->get($op->id);
                return [
                    'id'               => $op->id,
                    'nama'             => $op->nama,
                    'nik'              => $op->nik_karyawan ?: $op->nik,
                    'jabatan'          => $op->jabatan,
                    'no_hp'            => $op->no_hp,
                    'foto_profil'      => $op->foto ? asset('storage/' . $op->foto) : null,
                    'status_kehadiran' => $this->statusKehadiran($a, $office),
                ];
            });

        return response()->json(['data' => $operators]);
    }

    protected function statusKehadiran(?Absensi $a, array $office): string
    {
        if (!$a) return 'tidak_hadir';
        if (in_array($a->status, ['izin', 'sakit', 'cuti', 'libur'], true)) return $a->status;
        if ($a->jam_masuk) {
            $masuk = Carbon::createFromFormat('H:i', substr((string) $a->jam_masuk, 0, 5));
            $batas = Carbon::createFromFormat('H:i', $office['batas_terlambat']);
            return $masuk->gt($batas) ? 'terlambat' : 'hadir';
        }
        return 'tidak_hadir';
    }
}
