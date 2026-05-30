<?php

namespace App\Http\Controllers;

use App\Models\Barang;
use App\Models\KategoriBarang;
use App\Models\PurchaseRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PurchaseRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseRequest::with('requester', 'approver')
            ->withCount('details');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nomor_pr', 'like', "%{$search}%")
                  ->orWhere('nama_site', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($from = $request->get('from_date')) {
            $query->where('posting_date', '>=', $from);
        }
        if ($to = $request->get('to_date')) {
            $query->where('posting_date', '<=', $to);
        }

        $purchaseRequests = $query->orderByDesc('posting_date')
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('PurchaseRequest/Index', [
            'purchaseRequests' => $purchaseRequests,
            'filters' => $request->only(['search', 'status', 'from_date', 'to_date']),
        ]);
    }

    public function create()
    {
        return Inertia::render('PurchaseRequest/Form', [
            'kategoriBarang' => KategoriBarang::orderBy('nama')->get(['id', 'nama']),
            'barangList' => Barang::orderBy('nama_barang')->get(['id', 'kategori_barang_id', 'kode_barang', 'nama_barang', 'satuan']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'domisili' => 'required|in:HO,Site',
            'jenis_pr' => 'required|in:Inventory,Asset',
            'kode_site' => 'required|string|max:50',
            'nama_site' => 'required|string|max:255',
            'posting_date' => 'required|date',
            'lokasi_gudang' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lampiran' => 'nullable|file|max:10240',
            'details' => 'required|array|min:1',
            'details.*.jenis_barang' => 'required|string|max:255',
            'details.*.barcode' => 'nullable|string|max:255',
            'details.*.kode_barang' => 'required|string|max:50',
            'details.*.nama_barang' => 'required|string|max:255',
            'details.*.satuan' => 'required|string|max:50',
            'details.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $lampiranPath = null;
        if ($request->hasFile('lampiran')) {
            $lampiranPath = $request->file('lampiran')->store('purchase-requests', 'public');
        }

        $nomorPr = PurchaseRequest::generateNumber('PR');

        DB::transaction(function () use ($validated, $lampiranPath, $nomorPr) {
            $pr = PurchaseRequest::create([
                'nomor_pr' => $nomorPr,
                'domisili' => $validated['domisili'],
                'jenis_pr' => $validated['jenis_pr'],
                'kode_site' => $validated['kode_site'],
                'nama_site' => $validated['nama_site'],
                'posting_date' => $validated['posting_date'],
                'lokasi_gudang' => $validated['lokasi_gudang'],
                'keterangan' => $validated['keterangan'] ?? null,
                'lampiran' => $lampiranPath,
                'requested_by' => auth()->id(),
                'status' => 'Pending',
            ]);

            foreach ($validated['details'] as $detail) {
                $pr->details()->create($detail);
            }
        });

        return redirect()->route('purchase-request.index')
            ->with('success', 'Purchase Request berhasil dibuat.');
    }

    public function show(PurchaseRequest $purchaseRequest)
    {
        $purchaseRequest->load('details', 'requester', 'approver');

        return Inertia::render('PurchaseRequest/Show', [
            'purchaseRequest' => $purchaseRequest,
        ]);
    }

    public function edit(PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status === 'Approved') {
            return redirect()->route('purchase-request.index')
                ->with('error', 'Purchase Request yang sudah diapprove tidak dapat diedit.');
        }

        $purchaseRequest->load('details');

        return Inertia::render('PurchaseRequest/Form', [
            'purchaseRequest' => $purchaseRequest,
            'kategoriBarang' => KategoriBarang::orderBy('nama')->get(['id', 'nama']),
            'barangList' => Barang::orderBy('nama_barang')->get(['id', 'kategori_barang_id', 'kode_barang', 'nama_barang', 'satuan']),
        ]);
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status === 'Approved') {
            return redirect()->route('purchase-request.index')
                ->with('error', 'Purchase Request yang sudah diapprove tidak dapat diedit.');
        }

        $validated = $request->validate([
            'domisili' => 'required|in:HO,Site',
            'jenis_pr' => 'required|in:Inventory,Asset',
            'kode_site' => 'required|string|max:50',
            'nama_site' => 'required|string|max:255',
            'posting_date' => 'required|date',
            'lokasi_gudang' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
            'lampiran' => 'nullable|file|max:10240',
            'details' => 'required|array|min:1',
            'details.*.jenis_barang' => 'required|string|max:255',
            'details.*.barcode' => 'nullable|string|max:255',
            'details.*.kode_barang' => 'required|string|max:50',
            'details.*.nama_barang' => 'required|string|max:255',
            'details.*.satuan' => 'required|string|max:50',
            'details.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $lampiranPath = $purchaseRequest->lampiran;
        if ($request->hasFile('lampiran')) {
            if ($lampiranPath) {
                Storage::disk('public')->delete($lampiranPath);
            }
            $lampiranPath = $request->file('lampiran')->store('purchase-requests', 'public');
        }

        DB::transaction(function () use ($validated, $purchaseRequest, $lampiranPath) {
            $purchaseRequest->update([
                'domisili' => $validated['domisili'],
                'jenis_pr' => $validated['jenis_pr'],
                'kode_site' => $validated['kode_site'],
                'nama_site' => $validated['nama_site'],
                'posting_date' => $validated['posting_date'],
                'lokasi_gudang' => $validated['lokasi_gudang'],
                'keterangan' => $validated['keterangan'] ?? null,
                'lampiran' => $lampiranPath,
                'status' => 'Pending',
            ]);

            $purchaseRequest->details()->delete();

            foreach ($validated['details'] as $detail) {
                $purchaseRequest->details()->create($detail);
            }
        });

        return redirect()->route('purchase-request.index')
            ->with('success', 'Purchase Request berhasil diperbarui.');
    }

    public function destroy(PurchaseRequest $purchaseRequest)
    {
        if ($purchaseRequest->status === 'Approved') {
            return redirect()->route('purchase-request.index')
                ->with('error', 'Purchase Request yang sudah diapprove tidak dapat dihapus.');
        }

        if ($purchaseRequest->lampiran) {
            Storage::disk('public')->delete($purchaseRequest->lampiran);
        }

        $purchaseRequest->delete();

        return redirect()->route('purchase-request.index')
            ->with('success', 'Purchase Request berhasil dihapus.');
    }

    public function approve(Request $request, PurchaseRequest $purchaseRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:Approved,Rejected',
            'approval_note' => 'nullable|string|max:500',
        ]);

        $purchaseRequest->update([
            'status' => $validated['status'],
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'approval_note' => $validated['approval_note'] ?? null,
        ]);

        $label = $validated['status'] === 'Approved' ? 'diapprove' : 'ditolak';

        return redirect()->route('purchase-request.show', $purchaseRequest)
            ->with('success', "Purchase Request berhasil {$label}.");
    }
}
