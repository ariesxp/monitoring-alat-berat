<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\IzinCuti;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class IzinCutiController extends Controller
{
    /**
     * GET /izin — Daftar pengajuan izin/cuti.
     * Supervisor: seluruh pengajuan (filter status). Operator: miliknya sendiri.
     */
    public function index(Request $request)
    {
        $query = IzinCuti::with(['operator', 'pemroses'])
            ->orderByDesc('created_at');

        if (!$this->isSupervisor($request)) {
            $op = $this->operatorOf($request);
            $query->where('operator_id', $op->id);
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $items = $query->get()->map(fn ($i) => $this->transform($i));

        // Hitung jumlah per status untuk badge tab.
        $base = IzinCuti::query();
        if (!$this->isSupervisor($request)) {
            $base->where('operator_id', $this->operatorOf($request)->id);
        }

        return response()->json([
            'data'  => $items,
            'count' => [
                'menunggu'  => (clone $base)->where('status', 'menunggu')->count(),
                'disetujui' => (clone $base)->where('status', 'disetujui')->count(),
                'ditolak'   => (clone $base)->where('status', 'ditolak')->count(),
            ],
        ]);
    }

    /**
     * POST /izin — Karyawan mengajukan izin/sakit/cuti.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'jenis'           => 'required|in:izin,sakit,cuti',
            'tanggal_mulai'   => 'required|date',
            'tanggal_selesai' => 'required|date|after_or_equal:tanggal_mulai',
            'alasan'          => 'nullable|string|max:500',
            'lampiran'        => 'nullable|image|max:5120',
        ]);

        $operator = $this->operatorOf($request);

        $mulai = Carbon::parse($data['tanggal_mulai']);
        $selesai = Carbon::parse($data['tanggal_selesai']);
        $jumlahHari = $mulai->diffInDays($selesai) + 1;

        $lampiran = null;
        if ($request->hasFile('lampiran')) {
            $lampiran = $request->file('lampiran')->store('izin', 'public');
        }

        $izin = IzinCuti::create([
            'operator_id'     => $operator->id,
            'jenis'           => $data['jenis'],
            'tanggal_mulai'   => $data['tanggal_mulai'],
            'tanggal_selesai' => $data['tanggal_selesai'],
            'jumlah_hari'     => $jumlahHari,
            'alasan'          => $data['alasan'] ?? null,
            'lampiran'        => $lampiran,
            'status'          => 'menunggu',
        ]);

        return response()->json([
            'message' => 'Pengajuan izin/cuti berhasil dikirim.',
            'data'    => $this->transform($izin->fresh('operator')),
        ], 201);
    }

    /**
     * POST /izin/{izin}/status — Supervisor menyetujui / menolak.
     */
    public function updateStatus(Request $request, IzinCuti $izin)
    {
        $this->authorizeSupervisor($request);

        $data = $request->validate([
            'status'  => 'required|in:disetujui,ditolak',
            'catatan' => 'nullable|string|max:500',
        ]);

        $izin->update([
            'status'           => $data['status'],
            'catatan_approval' => $data['catatan'] ?? null,
            'diproses_oleh'    => $request->user()->id,
            'diproses_pada'    => now(),
        ]);

        return response()->json([
            'message' => $data['status'] === 'disetujui' ? 'Pengajuan disetujui.' : 'Pengajuan ditolak.',
            'data'    => $this->transform($izin->fresh(['operator', 'pemroses'])),
        ]);
    }

    // ---------------------------------------------------------------------

    protected function isSupervisor(Request $request): bool
    {
        return in_array($request->user()->role, ['supervisor', 'admin'], true);
    }

    protected function authorizeSupervisor(Request $request): void
    {
        abort_unless($this->isSupervisor($request), 403, 'Hanya supervisor yang dapat mengakses.');
    }

    protected function operatorOf(Request $request)
    {
        $operator = $request->user()->operator;
        if (!$operator) {
            throw ValidationException::withMessages([
                'operator' => ['Akun Anda belum ditautkan ke data karyawan. Hubungi admin.'],
            ]);
        }
        return $operator;
    }

    protected function transform(IzinCuti $i): array
    {
        return [
            'id'              => $i->id,
            'operator_id'     => $i->operator_id,
            'nama'            => $i->operator?->nama,
            'nik'             => $i->operator ? ($i->operator->nik_karyawan ?: $i->operator->nik) : null,
            'foto_profil'     => $i->operator?->foto ? asset('storage/' . $i->operator->foto) : null,
            'jenis'           => $i->jenis,
            'jenis_label'     => $this->jenisLabel($i->jenis),
            'tanggal_mulai'   => optional($i->tanggal_mulai)->toDateString(),
            'tanggal_selesai' => optional($i->tanggal_selesai)->toDateString(),
            'jumlah_hari'     => (float) $i->jumlah_hari,
            'alasan'          => $i->alasan,
            'lampiran_url'    => $i->lampiran ? asset('storage/' . $i->lampiran) : null,
            'status'          => $i->status,
            'catatan_approval' => $i->catatan_approval,
            'diproses_oleh'   => $i->pemroses?->name,
            'diproses_pada'   => optional($i->diproses_pada)->toIso8601String(),
            'created_at'      => optional($i->created_at)->toIso8601String(),
        ];
    }

    protected function jenisLabel(string $jenis): string
    {
        return match ($jenis) {
            'sakit' => 'Izin Sakit',
            'cuti'  => 'Cuti Tahunan',
            default => 'Izin Urusan Pribadi',
        };
    }
}
