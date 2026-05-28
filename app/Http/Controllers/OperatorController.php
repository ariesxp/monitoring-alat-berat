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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'nik' => 'required|string|max:20|unique:operators',
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
}
