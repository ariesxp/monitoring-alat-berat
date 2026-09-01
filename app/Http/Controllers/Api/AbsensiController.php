<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Office;
use App\Models\Operator;
use App\Support\Geo;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AbsensiController extends Controller
{
    /**
     * GET /absensi/status
     * Status absensi hari ini untuk operator (karyawan) yang login,
     * beserta konfigurasi lokasi kantor untuk validasi radius di aplikasi.
     */
    public function status(Request $request)
    {
        $operator = $this->operatorOf($request);
        $office = Geo::officeConfig();
        $offices = Geo::offices();
        $today = Absensi::where('operator_id', $operator->id)
            ->whereDate('tanggal', now()->toDateString())
            ->first();

        return response()->json([
            'operator' => $this->operatorPayload($operator),
            'offices'  => $offices,           // multi-office: daftar semua kantor aktif
            'office'   => $office,             // kompatibilitas format lama (satu kantor)
            'today'    => $today ? $this->transform($today) : null,
            'sudah_masuk'  => (bool) ($today?->jam_masuk),
            'sudah_pulang' => (bool) ($today?->jam_pulang),
        ]);
    }

    /**
     * POST /absensi/masuk  — Check-in dengan selfie + geotag.
     * Wajib berada dalam radius lokasi kantor.
     */
    public function checkIn(Request $request)
    {
        $data = $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'office_id' => 'nullable|integer',
            'foto'      => 'required|image|max:5120',
            'keterangan' => 'nullable|string|max:255',
        ]);

        $operator = $this->operatorOf($request);

        // Validasi radius terhadap SEMUA kantor: pilih yang terdekat & masih
        // di dalam radiusnya. office_id dari aplikasi hanya petunjuk; server
        // tetap memverifikasi sendiri berdasarkan koordinat.
        $near = Geo::nearestOfficeInRadius((float) $data['latitude'], (float) $data['longitude']);
        if ($near === null) {
            throw ValidationException::withMessages([
                'latitude' => ['Anda berada di luar radius kantor manapun.'],
            ]);
        }
        $office = $near['office'];
        $jarak = $near['jarak'];

        $existing = Absensi::where('operator_id', $operator->id)
            ->whereDate('tanggal', now()->toDateString())
            ->first();

        if ($existing && $existing->jam_masuk) {
            throw ValidationException::withMessages([
                'foto' => ['Anda sudah melakukan absen masuk hari ini.'],
            ]);
        }

        $path = $request->file('foto')->store('absensi', 'public');

        $absensi = Absensi::updateOrCreate(
            ['operator_id' => $operator->id, 'tanggal' => now()->toDateString()],
            [
                'jam_masuk'    => now()->format('H:i'),
                'status'       => 'hadir',
                'metode'       => 'GPS',
                'lokasi'       => $office['nama'],
                'office_id'    => $office['id'],
                'foto_masuk'   => $path,
                'lat_masuk'    => $data['latitude'],
                'lng_masuk'    => $data['longitude'],
                'jarak_masuk'  => $jarak,
                'keterangan'   => $data['keterangan'] ?? null,
                'sumber_input' => 'android',
            ]
        );

        return response()->json([
            'message' => "Absen masuk berhasil dicatat di {$office['nama']}.",
            'data'    => $this->transform($absensi->fresh('operator')),
        ], 201);
    }

    /**
     * POST /absensi/pulang — Check-out dengan selfie + geotag.
     */
    public function checkOut(Request $request)
    {
        $data = $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'office_id' => 'nullable|integer',
            'foto'      => 'required|image|max:5120',
        ]);

        $operator = $this->operatorOf($request);

        $near = Geo::nearestOfficeInRadius((float) $data['latitude'], (float) $data['longitude']);
        if ($near === null) {
            throw ValidationException::withMessages([
                'latitude' => ['Anda berada di luar radius kantor manapun.'],
            ]);
        }
        $office = $near['office'];
        $jarak = $near['jarak'];

        $absensi = Absensi::where('operator_id', $operator->id)
            ->whereDate('tanggal', now()->toDateString())
            ->first();

        if (!$absensi || !$absensi->jam_masuk) {
            throw ValidationException::withMessages([
                'foto' => ['Anda belum absen masuk hari ini.'],
            ]);
        }

        if ($absensi->jam_pulang) {
            throw ValidationException::withMessages([
                'foto' => ['Anda sudah melakukan absen pulang hari ini.'],
            ]);
        }

        $path = $request->file('foto')->store('absensi', 'public');

        $absensi->update([
            'jam_pulang'   => now()->format('H:i'),
            'foto_pulang'  => $path,
            'lat_pulang'   => $data['latitude'],
            'lng_pulang'   => $data['longitude'],
            'jarak_pulang' => $jarak,
        ]);

        return response()->json([
            'message' => "Absen pulang berhasil dicatat di {$office['nama']}.",
            'data'    => $this->transform($absensi->fresh('operator')),
        ]);
    }

    /**
     * GET /absensi/hari-ini — Daftar absensi seluruh pegawai (supervisi).
     * Query: tanggal, filter (semua|hadir|terlambat|tidak_hadir), search.
     */
    public function todayList(Request $request)
    {
        $this->authorizeSupervisor($request);

        $tanggal = $request->get('tanggal', now()->toDateString());
        $office = Geo::officeConfig();

        $operators = Operator::aktif()
            ->when($request->get('search'), function ($q) use ($request) {
                $s = $request->get('search');
                $q->where(function ($qq) use ($s) {
                    $qq->where('nama', 'like', "%{$s}%")
                       ->orWhere('nik', 'like', "%{$s}%")
                       ->orWhere('nik_karyawan', 'like', "%{$s}%");
                });
            })
            ->orderBy('nama')
            ->get();

        $absensiMap = Absensi::whereDate('tanggal', $tanggal)
            ->get()
            ->keyBy('operator_id');

        $items = $operators->map(function (Operator $op) use ($absensiMap, $office) {
            $a = $absensiMap->get($op->id);
            return $this->rowPayload($op, $a, $office);
        });

        $filter = $request->get('filter', 'semua');
        if ($filter !== 'semua') {
            $items = $items->filter(fn ($i) => $i['status_kehadiran'] === $filter)->values();
        }

        return response()->json([
            'tanggal'  => $tanggal,
            'summary'  => $this->summaryFor($tanggal),
            'data'     => $items->values(),
        ]);
    }

    /**
     * GET /absensi/dashboard — Ringkasan hari ini untuk beranda supervisor.
     */
    public function dashboard(Request $request)
    {
        $this->authorizeSupervisor($request);
        $tanggal = $request->get('tanggal', now()->toDateString());

        return response()->json([
            'tanggal' => $tanggal,
            'summary' => $this->summaryFor($tanggal),
        ]);
    }

    /**
     * GET /absensi/{absensi} — Detail satu absensi.
     */
    public function show(Request $request, Absensi $absensi)
    {
        $absensi->load(['operator', 'penyetuju']);

        // Operator hanya boleh melihat miliknya sendiri.
        if (!$this->isSupervisor($request)) {
            $op = $request->user()->operator;
            abort_unless($op && $op->id === $absensi->operator_id, 403, 'Tidak diizinkan.');
        }

        return response()->json(['data' => $this->transform($absensi, true)]);
    }

    /**
     * POST /absensi/{absensi}/setujui — Supervisor menyetujui data absensi.
     */
    public function approve(Request $request, Absensi $absensi)
    {
        $this->authorizeSupervisor($request);

        $absensi->update([
            'disetujui_oleh' => $request->user()->id,
            'disetujui_pada' => now(),
        ]);

        return response()->json([
            'message' => 'Data absensi disetujui.',
            'data'    => $this->transform($absensi->fresh(['operator', 'penyetuju']), true),
        ]);
    }

    /**
     * GET /absensi/riwayat — Riwayat absensi.
     * Operator: miliknya sendiri. Supervisor: seluruh pegawai (bisa operator_id).
     */
    public function riwayat(Request $request)
    {
        $query = Absensi::with('operator')->orderByDesc('tanggal')->orderByDesc('id');

        if ($this->isSupervisor($request)) {
            if ($opId = $request->get('operator_id')) {
                $query->where('operator_id', $opId);
            }
        } else {
            $op = $this->operatorOf($request);
            $query->where('operator_id', $op->id);
        }

        if ($from = $request->get('from')) {
            $query->whereDate('tanggal', '>=', $from);
        }
        if ($to = $request->get('to')) {
            $query->whereDate('tanggal', '<=', $to);
        }

        $paginated = $query->paginate($request->integer('per_page', 30));

        return response()->json([
            'data'         => collect($paginated->items())->map(fn ($a) => $this->transform($a)),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
        ]);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    protected function operatorOf(Request $request): Operator
    {
        $operator = $request->user()->operator;

        if (!$operator) {
            throw ValidationException::withMessages([
                'operator' => ['Akun Anda belum ditautkan ke data karyawan. Hubungi admin.'],
            ]);
        }

        return $operator;
    }

    protected function isSupervisor(Request $request): bool
    {
        return in_array($request->user()->role, ['supervisor', 'admin'], true);
    }

    protected function authorizeSupervisor(Request $request): void
    {
        abort_unless($this->isSupervisor($request), 403, 'Hanya supervisor yang dapat mengakses.');
    }

    /** Ringkasan jumlah kehadiran untuk sebuah tanggal. */
    protected function summaryFor(string $tanggal): array
    {
        $office = Geo::officeConfig();
        $total = Operator::aktif()->count();

        $absensi = Absensi::whereDate('tanggal', $tanggal)->get();

        $hadir = 0; $terlambat = 0; $izin = 0;
        $absenByOp = $absensi->keyBy('operator_id');

        foreach ($absensi as $a) {
            $st = $this->statusKehadiran($a, $office);
            if ($st === 'hadir') $hadir++;
            elseif ($st === 'terlambat') $terlambat++;
            elseif (in_array($st, ['izin', 'sakit', 'cuti'], true)) $izin++;
        }

        $hadirTotal = $hadir + $terlambat;
        $tidakHadir = max(0, $total - $hadirTotal - $izin);

        return [
            'total_pegawai' => $total,
            'hadir'         => $hadirTotal,
            'terlambat'     => $terlambat,
            'izin'          => $izin,
            'tidak_hadir'   => $tidakHadir,
            'persen_hadir'  => $total > 0 ? round($hadirTotal / $total * 100) : 0,
        ];
    }

    /** Menentukan status kehadiran turunan (untuk filter & tampilan). */
    protected function statusKehadiran(?Absensi $a, array $office): string
    {
        if (!$a) return 'tidak_hadir';

        if (in_array($a->status, ['izin', 'sakit', 'cuti', 'libur'], true)) {
            return $a->status;
        }

        if ($a->jam_masuk) {
            $masuk = Carbon::createFromFormat('H:i', substr((string) $a->jam_masuk, 0, 5));
            $batas = Carbon::createFromFormat('H:i', $this->batasTerlambatFor($a, $office));
            return $masuk->gt($batas) ? 'terlambat' : 'hadir';
        }

        return 'tidak_hadir';
    }

    /**
     * Batas jam terlambat yang berlaku untuk sebuah absensi.
     *
     * Diambil dari kantor tempat absensi dilakukan (kolom offices.batas_terlambat),
     * mis. Head Office 09:00 vs Site lain 07:00. Bila kantor tidak punya setingan
     * sendiri (kolom kosong / absensi lama tanpa office_id), memakai batas global
     * dari tabel settings.
     */
    protected function batasTerlambatFor(Absensi $a, array $office): string
    {
        if ($a->office_id) {
            $perOffice = $this->officeBatasMap()[$a->office_id] ?? null;
            if (!empty($perOffice)) {
                return $perOffice;
            }
        }

        return $office['batas_terlambat'];
    }

    /** Peta [office_id => batas_terlambat], di-cache agar tidak query per baris. */
    protected ?array $officeBatasMap = null;

    protected function officeBatasMap(): array
    {
        return $this->officeBatasMap ??= Office::pluck('batas_terlambat', 'id')->all();
    }

    protected function rowPayload(Operator $op, ?Absensi $a, array $office): array
    {
        return [
            'absensi_id'       => $a?->id,
            'operator_id'      => $op->id,
            'nama'             => $op->nama,
            'nik'              => $op->nik_karyawan ?: $op->nik,
            'jabatan'          => $op->jabatan,
            'foto_profil'      => $op->foto ? asset('storage/' . $op->foto) : null,
            'jam_masuk'        => $a?->jam_masuk ? substr((string) $a->jam_masuk, 0, 5) : null,
            'jam_pulang'       => $a?->jam_pulang ? substr((string) $a->jam_pulang, 0, 5) : null,
            'lokasi'           => $a?->lokasi ?? $office['nama'],
            'status_kehadiran' => $this->statusKehadiran($a, $office),
        ];
    }

    protected function operatorPayload(Operator $op): array
    {
        return [
            'id'      => $op->id,
            'nama'    => $op->nama,
            'nik'     => $op->nik_karyawan ?: $op->nik,
            'jabatan' => $op->jabatan,
            'foto'    => $op->foto ? asset('storage/' . $op->foto) : null,
        ];
    }

    protected function transform(Absensi $a, bool $detail = false): array
    {
        $office = Geo::officeConfig();

        $payload = [
            'id'               => $a->id,
            'operator_id'      => $a->operator_id,
            'nama'             => $a->operator?->nama,
            'nik'              => $a->operator ? ($a->operator->nik_karyawan ?: $a->operator->nik) : null,
            'jabatan'          => $a->operator?->jabatan,
            'foto_profil'      => $a->operator?->foto ? asset('storage/' . $a->operator->foto) : null,
            'tanggal'          => optional($a->tanggal)->toDateString(),
            'jam_masuk'        => $a->jam_masuk ? substr((string) $a->jam_masuk, 0, 5) : null,
            'jam_pulang'       => $a->jam_pulang ? substr((string) $a->jam_pulang, 0, 5) : null,
            'status'           => $a->status,
            'status_kehadiran' => $this->statusKehadiran($a, $office),
            'metode'           => $a->metode,
            'lokasi'           => $a->lokasi,
            'keterangan'       => $a->keterangan,
            'sumber_input'     => $a->sumber_input,
        ];

        if ($detail) {
            $payload = array_merge($payload, [
                'foto_masuk'   => $a->foto_masuk ? asset('storage/' . $a->foto_masuk) : null,
                'foto_pulang'  => $a->foto_pulang ? asset('storage/' . $a->foto_pulang) : null,
                'lat_masuk'    => $a->lat_masuk !== null ? (float) $a->lat_masuk : null,
                'lng_masuk'    => $a->lng_masuk !== null ? (float) $a->lng_masuk : null,
                'jarak_masuk'  => $a->jarak_masuk,
                'lat_pulang'   => $a->lat_pulang !== null ? (float) $a->lat_pulang : null,
                'lng_pulang'   => $a->lng_pulang !== null ? (float) $a->lng_pulang : null,
                'jarak_pulang' => $a->jarak_pulang,
                'disetujui'    => (bool) $a->disetujui_oleh,
                'disetujui_oleh' => $a->penyetuju?->name,
                'disetujui_pada' => optional($a->disetujui_pada)->toIso8601String(),
                'radius_kantor'  => $office['radius_m'],
            ]);
        } else {
            $payload['foto_masuk'] = $a->foto_masuk ? asset('storage/' . $a->foto_masuk) : null;
        }

        return $payload;
    }
}
