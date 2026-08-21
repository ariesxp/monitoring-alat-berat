<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AlatBerat;
use App\Models\Barang;
use App\Models\PengeluaranGudang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengeluaranController extends Controller
{
    /**
     * Mencatat satu pengeluaran barang (1 item) dari aplikasi Android,
     * lalu mengurangi stok barang. Mendukung upload foto bukti opsional.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_pengeluaran' => 'nullable|string|max:100',
            'alat_berat_id'     => 'nullable|exists:alat_berat,id',
            'unit_penerima'     => 'nullable|string|max:255',
            'barang_id'         => 'required|exists:barang,id',
            'jumlah'            => 'required|numeric|min:0.01',
            'tanggal_keluar'   => 'nullable|date',
            'catatan'          => 'nullable|string',
            'foto'             => 'nullable|image|max:5120',
        ]);

        $barang = Barang::findOrFail($validated['barang_id']);

        if ($barang->stok_saat_ini < $validated['jumlah']) {
            return response()->json([
                'message' => "Stok {$barang->nama_barang} tidak mencukupi. Tersedia {$barang->stok_saat_ini} {$barang->satuan}.",
            ], 422);
        }

        // Tentukan tujuan / penerima (nama unit alat berat bila dipilih).
        $tujuan = $validated['unit_penerima'] ?? null;
        if (!$tujuan && !empty($validated['alat_berat_id'])) {
            $tujuan = optional(AlatBerat::find($validated['alat_berat_id']))->nama_alat;
        }
        $tujuan = $tujuan ?: 'Pengeluaran Android';

        $fotoPath = null;
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('pengeluaran', 'public');
        }

        $pengeluaran = DB::transaction(function () use ($validated, $barang, $tujuan, $fotoPath, $request) {
            $pengeluaran = PengeluaranGudang::create([
                'nomor_pengeluaran' => PengeluaranGudang::generateNumber('PK'),
                'tanggal_keluar'    => $validated['tanggal_keluar'] ?? now()->toDateString(),
                'alat_berat_id'     => $validated['alat_berat_id'] ?? null,
                'tujuan'            => $tujuan,
                'sumber_input'      => 'android',
                'jenis_pengeluaran' => $validated['jenis_pengeluaran'] ?? null,
                'foto'              => $fotoPath,
                'catatan'           => $validated['catatan'] ?? null,
                'created_by'        => $request->user()->id,
            ]);

            $pengeluaran->details()->create([
                'barang_id' => $barang->id,
                'jumlah'    => $validated['jumlah'],
                'catatan'   => $validated['catatan'] ?? null,
            ]);

            $barang->decrement('stok_saat_ini', $validated['jumlah']);

            return $pengeluaran;
        });

        return response()->json([
            'message' => 'Pengeluaran berhasil dicatat.',
            'data'    => $this->transform($pengeluaran->fresh(['details.barang', 'alatBerat', 'createdBy'])),
        ], 201);
    }

    /** Riwayat pengeluaran (paginated), terbaru dulu. */
    public function index(Request $request)
    {
        $query = PengeluaranGudang::with(['details.barang', 'alatBerat', 'createdBy'])
            ->orderByDesc('tanggal_keluar')
            ->orderByDesc('id');

        if ($request->boolean('mine', false)) {
            $query->where('created_by', $request->user()->id);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_pengeluaran', 'like', "%{$search}%")
                  ->orWhere('tujuan', 'like', "%{$search}%");
            });
        }

        $paginated = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'data'         => collect($paginated->items())->map(fn ($p) => $this->transform($p)),
            'current_page' => $paginated->currentPage(),
            'last_page'    => $paginated->lastPage(),
            'total'        => $paginated->total(),
        ]);
    }

    public function show(PengeluaranGudang $pengeluaran)
    {
        return response()->json([
            'data' => $this->transform($pengeluaran->load(['details.barang', 'alatBerat', 'createdBy'])),
        ]);
    }

    protected function transform(PengeluaranGudang $p): array
    {
        $detail = $p->details->first();
        $barang = $detail?->barang;
        $jumlah = (float) ($detail?->jumlah ?? 0);
        $harga  = (float) ($barang?->harga_satuan ?? 0);

        return [
            'id'                => $p->id,
            'nomor_pengeluaran' => $p->nomor_pengeluaran,
            'tanggal_keluar'    => optional($p->tanggal_keluar)->toDateString(),
            'jenis_pengeluaran' => $p->jenis_pengeluaran,
            'tujuan'            => $p->tujuan,
            'alat_berat'        => $p->alatBerat?->nama_alat,
            'barang'            => $barang?->nama_barang,
            'satuan'            => $barang?->satuan,
            'jumlah'            => $jumlah,
            'harga_satuan'      => $harga,
            'total_nilai'       => $jumlah * $harga,
            'catatan'           => $p->catatan,
            'foto_url'          => $p->foto ? asset('storage/' . $p->foto) : null,
            'sumber_input'      => $p->sumber_input,
            'petugas'           => $p->createdBy?->name,
            'created_at'        => optional($p->created_at)->toIso8601String(),
        ];
    }
}
