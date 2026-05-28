<?php

namespace App\Services;

class WhatsappCommandParser
{
    public function parse(string $message): ?array
    {
        $message = trim($message);
        $parts = explode('#', $message);
        $command = strtoupper(trim($parts[0] ?? ''));

        return match ($command) {
            'LAPORAN' => $this->parseLaporan($parts),
            'ABSEN' => $this->parseAbsen($parts),
            'TERIMA' => $this->parseTerima($parts),
            'STOK' => $this->parseStok($parts),
            'HELP', 'BANTUAN' => ['command' => 'help', 'data' => []],
            default => null,
        };
    }

    private function parseLaporan(array $parts): ?array
    {
        if (count($parts) < 6) return null;

        return [
            'command' => 'laporan',
            'data' => [
                'nomor_spk' => trim($parts[1]),
                'jam_mulai' => trim($parts[2]),
                'jam_selesai' => trim($parts[3]),
                'bbm_liter' => (float) trim($parts[4]),
                'kondisi_alat' => strtolower(trim($parts[5])),
                'catatan' => trim($parts[6] ?? ''),
            ],
        ];
    }

    private function parseAbsen(array $parts): ?array
    {
        if (count($parts) < 2) return null;

        return [
            'command' => 'absen',
            'data' => [
                'status' => strtolower(trim($parts[1])),
                'keterangan' => trim($parts[2] ?? ''),
            ],
        ];
    }

    private function parseTerima(array $parts): ?array
    {
        if (count($parts) < 5) return null;

        return [
            'command' => 'terima',
            'data' => [
                'nama_barang' => trim($parts[1]),
                'jumlah' => (float) trim($parts[2]),
                'satuan' => trim($parts[3]),
                'supplier' => trim($parts[4]),
            ],
        ];
    }

    private function parseStok(array $parts): ?array
    {
        return [
            'command' => 'stok',
            'data' => [
                'kode_barang' => trim($parts[1] ?? 'semua'),
            ],
        ];
    }
}
