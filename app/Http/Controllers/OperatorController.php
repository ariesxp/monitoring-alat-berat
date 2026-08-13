<?php

namespace App\Http\Controllers;

use App\Models\Golongan;
use App\Models\Operator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index(Request $request)
    {
        $query = Operator::with(['user', 'golongan']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('jabatan', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        return Inertia::render('Operator/Index', [
            'operators' => $query->orderByDesc('created_at')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Operator/Form', [
            'golongans' => Golongan::orderBy('kode_golongan')->get(),
            'nikMeta' => [
                'yymm' => now()->format('ym'),
                'nextSeq' => [
                    '01' => $this->nextNikSeq('01'),
                    '02' => $this->nextNikSeq('02'),
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nik' => 'required|string|max:20|unique:operators',
            'nik_karyawan' => 'nullable|string|max:20|unique:operators,nik_karyawan',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'jabatan' => 'required|string|max:100',
            'departemen' => 'nullable|string|max:50',
            'golongan_id' => 'nullable|exists:golongans,id',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'nullable|numeric|min:0',
            'tanggal_masuk' => 'required|date',
            'status' => 'required|in:aktif,tidak_aktif,cuti',
            'status_perkawinan' => 'nullable|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'pendidikan' => 'nullable|string|max:50',
        ]);

        if (!empty($validated['golongan_id'])) {
            $golongan = Golongan::find($validated['golongan_id']);
            if ($golongan) {
                $validated['gaji_pokok'] = $golongan->gaji_golongan;
            }
        }

        $validated['kode_karyawan'] = $this->generateKodeKaryawan($validated['jabatan']);

        if (empty($validated['nik_karyawan'])) {
            $validated['nik_karyawan'] = $this->generateNik($validated['departemen'] ?? null);
        }

        Operator::create($validated);

        return redirect()->route('operator.index')
            ->with('success', 'Operator berhasil ditambahkan.');
    }

    public function show(Operator $operator)
    {
        $operator->load(['absensi' => fn ($q) => $q->latest('tanggal')->limit(30), 'detailGaji.penggajian', 'golongan']);

        return Inertia::render('Operator/Show', [
            'operator' => $operator,
        ]);
    }

    public function edit(Operator $operator)
    {
        return Inertia::render('Operator/Form', [
            'operator' => $operator,
            'golongans' => Golongan::orderBy('kode_golongan')->get(),
        ]);
    }

    public function update(Request $request, Operator $operator)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nik' => 'required|string|max:20|unique:operators,nik,' . $operator->id,
            'nik_karyawan' => 'nullable|string|max:20|unique:operators,nik_karyawan,' . $operator->id,
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'jabatan' => 'required|string|max:100',
            'departemen' => 'nullable|string|max:50',
            'golongan_id' => 'nullable|exists:golongans,id',
            'gaji_pokok' => 'required|numeric|min:0',
            'tunjangan' => 'nullable|numeric|min:0',
            'tanggal_masuk' => 'required|date',
            'status' => 'required|in:aktif,tidak_aktif,cuti',
            'status_perkawinan' => 'nullable|in:Belum Kawin,Kawin,Cerai Hidup,Cerai Mati',
            'pendidikan' => 'nullable|string|max:50',
        ]);

        if (!empty($validated['golongan_id'])) {
            $golongan = Golongan::find($validated['golongan_id']);
            if ($golongan) {
                $validated['gaji_pokok'] = $golongan->gaji_golongan;
            }
        }

        $operator->update($validated);

        return redirect()->route('operator.index')
            ->with('success', 'Operator berhasil diperbarui.');
    }

    public function destroy(Operator $operator)
    {
        $operator->delete();

        return redirect()->route('operator.index')
            ->with('success', 'Operator berhasil dihapus.');
    }

    private function generateKodeKaryawan(string $jabatan): string
    {
        $map = [
            'Direksi' => 'DIR',
            'Staff HO' => 'SHO',
            'Staff Site' => 'SIT',
            'Operator Excavator' => 'OEX',
            'Operator Dozer' => 'ODZ',
            'Operator Tractor' => 'OTR',
            'Driver' => 'DRV',
            'Mandor' => 'MDR',
            'Mekanik' => 'MKK',
            'Admin' => 'ADM',
            'Helper' => 'HLP',
        ];

        $kode = $map[$jabatan] ?? strtoupper(substr($jabatan, 0, 3));
        $bulanTahun = now()->format('my');

        $last = Operator::withTrashed()
            ->where('kode_karyawan', 'like', "{$kode}-{$bulanTahun}-%")
            ->orderByDesc('kode_karyawan')
            ->value('kode_karyawan');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;

        return sprintf('%s-%s-%03d', $kode, $bulanTahun, $seq);
    }

    private function divisionCode(?string $departemen): string
    {
        // Head Office = 01, Operasional (dan lainnya) = 02
        return $departemen === 'Head Office' ? '01' : '02';
    }

    private function nextNikSeq(string $aa): int
    {
        $niks = Operator::withTrashed()
            ->whereNotNull('nik_karyawan')
            ->pluck('nik_karyawan');

        $maxSeq = 0;
        foreach ($niks as $n) {
            if (strlen($n) === 10 && substr($n, 4, 2) === $aa) {
                $seq = (int) substr($n, 6, 4);
                if ($seq > $maxSeq) {
                    $maxSeq = $seq;
                }
            }
        }

        return $maxSeq + 1;
    }

    private function generateNik(?string $departemen): string
    {
        // Format: yymmaabbbb (tahun 2 digit + bulan 2 digit + kode divisi + nomor urut)
        $aa = $this->divisionCode($departemen);

        return sprintf('%s%s%04d', now()->format('ym'), $aa, $this->nextNikSeq($aa));
    }
}
