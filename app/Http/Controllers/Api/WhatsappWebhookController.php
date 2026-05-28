<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absensi;
use App\Models\Barang;
use App\Models\LaporanHarian;
use App\Models\PenerimaanGudang;
use App\Models\Spk;
use App\Models\WhatsappMessage;
use App\Models\WhatsappRegisteredNumber;
use App\Services\FonnteService;
use App\Services\WhatsappCommandParser;
use Illuminate\Http\Request;

class WhatsappWebhookController extends Controller
{
    public function handle(Request $request)
    {
        $sender = $request->input('sender');
        $message = $request->input('message');
        $name = $request->input('name', '');
        $device = $request->input('device', '');

        if (!$sender || !$message) {
            return response()->json(['status' => 'invalid']);
        }

        $waMessage = WhatsappMessage::create([
            'sender' => $sender,
            'sender_name' => $name,
            'message' => $message,
            'device' => $device,
            'direction' => 'incoming',
            'processing_status' => 'received',
        ]);

        $registered = WhatsappRegisteredNumber::where('phone_number', $sender)
            ->where('is_active', true)
            ->first();

        $fonnte = new FonnteService();

        if (!$registered) {
            $fonnte->sendMessage($sender, "Maaf, nomor Anda belum terdaftar. Hubungi admin untuk mendaftar.");
            $waMessage->update(['processing_status' => 'ignored']);
            return response()->json(['status' => 'unauthorized']);
        }

        $parser = new WhatsappCommandParser();
        $parsed = $parser->parse($message);

        if (!$parsed) {
            $fonnte->sendMessage($sender, $this->getHelpMessage());
            $waMessage->update(['processing_status' => 'failed', 'error_message' => 'Format tidak dikenali']);
            return response()->json(['status' => 'unknown_command']);
        }

        $waMessage->update([
            'parsed_command' => $parsed['command'],
            'parsed_data' => $parsed['data'],
            'processing_status' => 'parsed',
        ]);

        try {
            $reply = match ($parsed['command']) {
                'laporan' => $this->handleLaporan($parsed['data'], $registered, $waMessage),
                'absen' => $this->handleAbsen($parsed['data'], $registered, $waMessage),
                'terima' => $this->handleTerima($parsed['data'], $registered, $waMessage),
                'stok' => $this->handleStok($parsed['data']),
                'help' => $this->getHelpMessage(),
            };

            $waMessage->update(['processing_status' => 'processed']);
            $fonnte->sendMessage($sender, $reply);

        } catch (\Exception $e) {
            $waMessage->update([
                'processing_status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            $fonnte->sendMessage($sender, "Terjadi kesalahan: " . $e->getMessage());
        }

        return response()->json(['status' => 'ok']);
    }

    private function handleLaporan(array $data, WhatsappRegisteredNumber $reg, WhatsappMessage $waMessage): string
    {
        if (!$reg->can_input_laporan) {
            return "Anda tidak memiliki izin untuk input laporan.";
        }

        $spk = Spk::where('nomor_spk', $data['nomor_spk'])
            ->whereIn('status', ['disetujui', 'berlangsung'])
            ->first();

        if (!$spk) {
            return "SPK {$data['nomor_spk']} tidak ditemukan atau tidak aktif.";
        }

        $start = strtotime($data['jam_mulai']);
        $end = strtotime($data['jam_selesai']);
        $jamKerja = round(($end - $start) / 3600, 2);

        $laporan = LaporanHarian::create([
            'spk_id' => $spk->id,
            'alat_berat_id' => $spk->alat_berat_id,
            'operator_id' => $spk->operator_id,
            'tanggal' => now()->toDateString(),
            'jam_mulai' => $data['jam_mulai'],
            'jam_selesai' => $data['jam_selesai'],
            'jam_kerja' => $jamKerja,
            'bbm_liter' => $data['bbm_liter'],
            'hm_awal' => 0,
            'hm_akhir' => 0,
            'jenis_pekerjaan' => $data['catatan'] ?: 'Via WhatsApp',
            'kondisi_alat' => $data['kondisi_alat'],
            'sumber_input' => 'whatsapp',
            'created_by' => $reg->user_id ?? 1,
        ]);

        $waMessage->update([
            'related_model_type' => LaporanHarian::class,
            'related_model_id' => $laporan->id,
        ]);

        return "Laporan harian berhasil dicatat!\nSPK: {$spk->nomor_spk}\nJam: {$data['jam_mulai']} - {$data['jam_selesai']}\nBBM: {$data['bbm_liter']} liter\nKondisi: {$data['kondisi_alat']}";
    }

    private function handleAbsen(array $data, WhatsappRegisteredNumber $reg, WhatsappMessage $waMessage): string
    {
        if (!$reg->can_input_absensi) {
            return "Anda tidak memiliki izin untuk input absensi.";
        }

        if (!$reg->operator_id) {
            return "Nomor Anda belum terhubung dengan data operator.";
        }

        $absensi = Absensi::updateOrCreate(
            ['operator_id' => $reg->operator_id, 'tanggal' => now()->toDateString()],
            [
                'status' => $data['status'],
                'jam_masuk' => $data['status'] === 'hadir' ? now()->format('H:i') : null,
                'keterangan' => $data['keterangan'] ?: null,
                'sumber_input' => 'whatsapp',
            ]
        );

        $waMessage->update([
            'related_model_type' => Absensi::class,
            'related_model_id' => $absensi->id,
        ]);

        return "Absensi berhasil dicatat!\nTanggal: " . now()->format('d/m/Y') . "\nStatus: {$data['status']}";
    }

    private function handleTerima(array $data, WhatsappRegisteredNumber $reg, WhatsappMessage $waMessage): string
    {
        if (!$reg->can_input_penerimaan) {
            return "Anda tidak memiliki izin untuk input penerimaan.";
        }

        $barang = Barang::where('nama_barang', 'like', "%{$data['nama_barang']}%")->first();

        if (!$barang) {
            return "Barang '{$data['nama_barang']}' tidak ditemukan di database.";
        }

        $penerimaan = PenerimaanGudang::create([
            'nomor_penerimaan' => PenerimaanGudang::generateNumber('PG'),
            'tanggal_terima' => now()->toDateString(),
            'supplier' => $data['supplier'],
            'sumber_input' => 'whatsapp',
            'created_by' => $reg->user_id ?? 1,
        ]);

        $penerimaan->details()->create([
            'barang_id' => $barang->id,
            'jumlah' => $data['jumlah'],
            'harga_satuan' => $barang->harga_satuan,
            'total_harga' => $data['jumlah'] * $barang->harga_satuan,
        ]);

        $barang->increment('stok_saat_ini', $data['jumlah']);

        $waMessage->update([
            'related_model_type' => PenerimaanGudang::class,
            'related_model_id' => $penerimaan->id,
        ]);

        return "Penerimaan gudang berhasil dicatat!\nBarang: {$barang->nama_barang}\nJumlah: {$data['jumlah']} {$barang->satuan}\nSupplier: {$data['supplier']}";
    }

    private function handleStok(array $data): string
    {
        if ($data['kode_barang'] === 'semua') {
            $items = Barang::orderBy('nama_barang')->limit(20)->get();
            $lines = ["=== STOK GUDANG ==="];
            foreach ($items as $item) {
                $alert = $item->stok_saat_ini <= $item->stok_minimum ? ' ⚠️' : '';
                $lines[] = "{$item->kode_barang} - {$item->nama_barang}: {$item->stok_saat_ini} {$item->satuan}{$alert}";
            }
            return implode("\n", $lines);
        }

        $barang = Barang::where('kode_barang', $data['kode_barang'])->first();
        if (!$barang) {
            return "Barang dengan kode '{$data['kode_barang']}' tidak ditemukan.";
        }

        $alert = $barang->stok_saat_ini <= $barang->stok_minimum ? "\n⚠️ STOK MENIPIS!" : '';
        return "Stok {$barang->nama_barang}\nKode: {$barang->kode_barang}\nStok: {$barang->stok_saat_ini} {$barang->satuan}\nMinimum: {$barang->stok_minimum} {$barang->satuan}{$alert}";
    }

    private function getHelpMessage(): string
    {
        return "=== PERINTAH WHATSAPP ===\n\n"
            . "1. LAPORAN HARIAN:\nLAPORAN#[no_spk]#[jam_mulai]#[jam_selesai]#[bbm_liter]#[kondisi]#[catatan]\nContoh: LAPORAN#SPK-202605-0001#08:00#17:00#50#baik#galian pondasi\n\n"
            . "2. ABSENSI:\nABSEN#[status]#[keterangan]\nContoh: ABSEN#HADIR atau ABSEN#SAKIT#demam\n\n"
            . "3. PENERIMAAN GUDANG:\nTERIMA#[nama_barang]#[jumlah]#[satuan]#[supplier]\nContoh: TERIMA#Oli Mesin#20#liter#PT Pelumas\n\n"
            . "4. CEK STOK:\nSTOK#[kode_barang] atau STOK#semua\nContoh: STOK#OLI-001\n\n"
            . "Ketik BANTUAN untuk melihat pesan ini.";
    }
}
