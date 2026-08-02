<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CoaSeeder extends Seeder
{
    /**
     * Import Chart of Account berjenjang dari MASTER_COA_AOB.xlsx.
     *
     * Struktur file (kolom): Main Code | Sub Code | Account Name | Remarks | Parent
     *  - Level 1 (header)   : kode x"000"  (mis. 1000 ASSETS)          -> tanpa parent
     *  - Level 2 (grup/detil): kode "xy00" (mis. 1100 Current Assets)  -> parent header
     *                          atau detail langsung di bawah header (mis. 4101)
     *  - Level 3 (detail)   : kode lain    (mis. 1101 Kas Kecil Site)  -> parent grup
     *
     * Idempotent: memakai updateOrCreate pada account_number.
     */
    public function run(): void
    {
        $path = base_path('MASTER_COA_AOB.xlsx');
        if (! file_exists($path)) {
            $this->command?->error("File COA tidak ditemukan: {$path}");
            return;
        }

        $rows = IOFactory::load($path)->getActiveSheet()->toArray();

        // 1. Parse baris -> [kode => nama]. Nama = kolom non-kosong pertama (Sub Code / Account Name / Remarks).
        $entries = [];
        foreach ($rows as $i => $row) {
            if ($i === 0) {
                continue; // header tabel
            }
            $code = trim((string) ($row[0] ?? ''));
            if ($code === '' || ! preg_match('/^\d{3,}$/', $code)) {
                continue;
            }
            $name = '';
            foreach ([1, 2, 3] as $c) {
                $v = trim((string) ($row[$c] ?? ''));
                if ($v !== '') {
                    $name = $v;
                    break;
                }
            }
            $entries[$code] = $name !== '' ? $name : $code;
        }

        // Tipe akun berdasarkan digit kelas (hanya untuk akun detail).
        $typeByClass = [
            '1' => 'Activa',  // ASSETS
            '2' => 'Pasiva',  // LIABILITIES
            '3' => 'Pasiva',  // EQUITY
            '4' => 'Sale',    // REVENUE
            '5' => 'Cost',    // DIRECT COST
            '6' => 'Expense', // OPERATING EXPENSE
            '7' => 'Sale',    // OTHER INCOME
            '8' => 'Expense', // OTHER EXPENSE
        ];

        // 2. Tentukan kode parent untuk sebuah kode.
        $parentOf = function (string $code) use ($entries): ?string {
            if (preg_match('/^\d000$/', $code)) {
                return null; // header level 1
            }
            if (preg_match('/^\d\d00$/', $code)) {
                return $code[0] . '000'; // grup level 2 -> header
            }
            $group = substr($code, 0, 2) . '00';
            if (isset($entries[$group])) {
                return $group; // detail level 3 -> grup
            }
            return $code[0] . '000'; // detail level 2 langsung di bawah header
        };

        // Hitung level dengan menelusuri rantai parent.
        $computeLevel = function (string $code) use ($parentOf, $entries): int {
            $level = 1;
            $cur = $code;
            for ($guard = 0; $guard < 10; $guard++) {
                $p = $parentOf($cur);
                if ($p === null || $p === $cur || ! isset($entries[$p])) {
                    break;
                }
                $level++;
                $cur = $p;
            }
            return $level;
        };

        // 3. Seed berurutan berdasarkan level (parent lebih dulu) agar parent_id tersedia.
        $byLevel = [];
        foreach (array_keys($entries) as $code) {
            $code = (string) $code;
            $byLevel[$computeLevel($code)][] = $code;
        }
        ksort($byLevel);

        $idMap = [];
        $count = 0;
        foreach ($byLevel as $level => $codes) {
            foreach ($codes as $code) {
                $code = (string) $code;
                $parentCode = $parentOf($code);
                $parentId = ($parentCode !== null && isset($idMap[$parentCode])) ? $idMap[$parentCode] : null;
                $isDetail = ! preg_match('/00$/', $code); // kode berakhiran non-"00" = akun detail

                $account = Account::updateOrCreate(
                    ['account_number' => $code],
                    [
                        'account_description' => $entries[$code],
                        'parent_id' => $parentId,
                        'level' => $level,
                        'account_type' => $isDetail ? ($typeByClass[$code[0]] ?? null) : null,
                        'is_active' => true,
                    ]
                );
                $idMap[$code] = $account->id;
                $count++;
            }
        }

        // 4. Normalisasi akun lama yang sudah ada di DB tapi tidak ada di Excel:
        //    tetapkan level & parent berdasarkan pola kode agar ikut masuk pohon.
        $all = Account::all()->keyBy('account_number');
        foreach ($all as $code => $acc) {
            $code = (string) $code;
            if (isset($entries[$code]) || ! preg_match('/^\d{3,}$/', $code)) {
                continue;
            }
            if (preg_match('/^\d000$/', $code)) {
                $parentCode = null;
            } elseif (preg_match('/^\d\d00$/', $code)) {
                $parentCode = $code[0] . '000';
            } else {
                $group = substr($code, 0, 2) . '00';
                $parentCode = isset($all[$group]) ? $group : $code[0] . '000';
            }
            $parent = ($parentCode !== null && isset($all[$parentCode])) ? $all[$parentCode] : null;
            $acc->update([
                'parent_id' => $parent?->id,
                'level' => $parent ? ($parent->level ?: 1) + 1 : 1,
            ]);
        }

        $this->command?->info("COA berhasil diimpor: {$count} akun dari Excel (+ normalisasi akun lama).");
    }
}
