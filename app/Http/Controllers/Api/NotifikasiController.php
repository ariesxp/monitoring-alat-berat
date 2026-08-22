<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\IzinCuti;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    /**
     * GET /notifikasi — Feed notifikasi untuk supervisor:
     * pengajuan izin menunggu + karyawan terlambat hari ini.
     */
    public function index(Request $request)
    {
        $office = Geo::officeConfig();
        $items = collect();

        // Pengajuan izin/cuti menunggu
        IzinCuti::with('operator')->where('status', 'menunggu')
            ->latest()->get()->each(function ($i) use (&$items) {
                $items->push([
                    'tipe'     => 'izin',
                    'judul'    => 'Pengajuan ' . ucfirst($i->jenis) . ' menunggu',
                    'pesan'    => ($i->operator?->nama ?? 'Karyawan') . ' mengajukan ' . $i->jenis
                                  . ' (' . optional($i->tanggal_mulai)->toDateString() . ')',
                    'waktu'    => optional($i->created_at)->toIso8601String(),
                    'ref_id'   => $i->id,
                ]);
            });

        // Karyawan terlambat hari ini
        $batas = Carbon::createFromFormat('H:i', $office['batas_terlambat']);
        Absensi::with('operator')->whereDate('tanggal', now()->toDateString())
            ->whereNotNull('jam_masuk')->get()
            ->each(function ($a) use (&$items, $batas) {
                $masuk = Carbon::createFromFormat('H:i', substr((string) $a->jam_masuk, 0, 5));
                if ($masuk->gt($batas)) {
                    $items->push([
                        'tipe'   => 'terlambat',
                        'judul'  => 'Karyawan terlambat',
                        'pesan'  => ($a->operator?->nama ?? 'Karyawan') . ' absen masuk pukul ' . substr((string) $a->jam_masuk, 0, 5),
                        'waktu'  => optional($a->created_at)->toIso8601String(),
                        'ref_id' => $a->id,
                    ]);
                }
            });

        return response()->json([
            'data'  => $items->sortByDesc('waktu')->values(),
            'total' => $items->count(),
        ]);
    }
}
