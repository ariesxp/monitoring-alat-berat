<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FinancialReportController extends Controller
{
    public function neracaSaldo(Request $request)
    {
        $d = $this->compute($request);

        return Inertia::render('FinancialReport/NeracaSaldo', [
            'filters' => $d['filters'],
            'neracaSaldo' => $d['neracaSaldo'],
        ]);
    }

    public function labaRugi(Request $request)
    {
        $d = $this->compute($request);

        return Inertia::render('FinancialReport/LabaRugi', [
            'filters' => $d['filters'],
            'labaRugi' => $d['labaRugi'],
        ]);
    }

    public function neraca(Request $request)
    {
        $d = $this->compute($request);

        return Inertia::render('FinancialReport/Neraca', [
            'filters' => $d['filters'],
            'neraca' => $d['neraca'],
        ]);
    }

    public function trialBalance(Request $request)
    {
        $d = $this->compute($request);

        return Inertia::render('FinancialReport/TrialBalance', [
            'filters' => $d['filters'],
            'trialBalance' => $d['trialBalance'],
        ]);
    }

    /**
     * Hitung seluruh laporan keuangan dari agregasi debit/kredit per akun
     * pada transaksi Kas & Bank. Dipakai bersama oleh keempat modul laporan.
     */
    private function compute(Request $request): array
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');

        // Agregasi debit & kredit per akun dari petty_cash_details (difilter periode posting).
        $movements = DB::table('petty_cash_details as d')
            ->join('petty_cash as h', 'd.petty_cash_id', '=', 'h.id')
            ->when($startDate, fn ($q) => $q->whereDate('h.posting_date', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('h.posting_date', '<=', $endDate))
            ->groupBy('d.account_id')
            ->select('d.account_id', DB::raw('SUM(d.debit) as debit'), DB::raw('SUM(d.credit) as credit'))
            ->get()
            ->keyBy('account_id');

        // Semua akun posting-level (leaf) sebagai basis baris laporan.
        $accounts = Account::whereDoesntHave('children')
            ->orderBy('account_number')
            ->get(['id', 'account_number', 'account_description']);

        $rows = $accounts->map(function ($a) use ($movements) {
            $mv = $movements->get($a->id);
            $debit = (float) ($mv->debit ?? 0);
            $credit = (float) ($mv->credit ?? 0);

            return [
                'code' => (string) $a->account_number,
                'name' => $a->account_description ?? '-',
                'class' => substr((string) $a->account_number, 0, 1),
                'debit' => $debit,
                'credit' => $credit,
                'net' => $debit - $credit, // + = saldo debit, - = saldo kredit
            ];
        });

        $classNames = [
            '1' => 'ASET', '2' => 'KEWAJIBAN', '3' => 'EKUITAS', '4' => 'PENDAPATAN',
            '5' => 'BEBAN POKOK', '6' => 'BEBAN OPERASIONAL', '7' => 'PENDAPATAN LAIN', '8' => 'BEBAN LAIN',
        ];

        // Baris yang punya mutasi.
        $active = $rows->filter(fn ($r) => abs($r['debit']) > 0.001 || abs($r['credit']) > 0.001)->values();

        // Daftar baris per kelas dengan tanda sesuai saldo normal.
        $lineList = fn ($cls, $creditNormal) => $rows
            ->filter(fn ($r) => $r['class'] === $cls)
            ->map(fn ($r) => [
                'code' => $r['code'],
                'name' => $r['name'],
                'amount' => $creditNormal ? -$r['net'] : $r['net'],
            ])
            ->filter(fn ($l) => abs($l['amount']) > 0.001)
            ->values();

        // ---- 1. NERACA SALDO (trial balance rinci per akun) ----
        $tbRows = $active->map(fn ($r) => [
            'code' => $r['code'],
            'name' => $r['name'],
            'debit' => $r['net'] > 0 ? $r['net'] : 0,
            'credit' => $r['net'] < 0 ? -$r['net'] : 0,
        ])->values();

        $neracaSaldo = [
            'rows' => $tbRows,
            'totalDebit' => $tbRows->sum('debit'),
            'totalCredit' => $tbRows->sum('credit'),
        ];

        // ---- 2. LABA RUGI ----
        $pendapatanLines = $lineList('4', true);
        $hppLines = $lineList('5', false);
        $bebanOpLines = $lineList('6', false);
        $pendapatanLainLines = $lineList('7', true);
        $bebanLainLines = $lineList('8', false);

        $pendapatan = $pendapatanLines->sum('amount');
        $hpp = $hppLines->sum('amount');
        $labaKotor = $pendapatan - $hpp;
        $bebanOp = $bebanOpLines->sum('amount');
        $labaUsaha = $labaKotor - $bebanOp;
        $pendapatanLain = $pendapatanLainLines->sum('amount');
        $bebanLain = $bebanLainLines->sum('amount');
        $labaBersih = $labaUsaha + $pendapatanLain - $bebanLain;

        $labaRugi = [
            'pendapatan' => ['lines' => $pendapatanLines, 'total' => $pendapatan],
            'hpp' => ['lines' => $hppLines, 'total' => $hpp],
            'labaKotor' => $labaKotor,
            'bebanOperasional' => ['lines' => $bebanOpLines, 'total' => $bebanOp],
            'labaUsaha' => $labaUsaha,
            'pendapatanLain' => ['lines' => $pendapatanLainLines, 'total' => $pendapatanLain],
            'bebanLain' => ['lines' => $bebanLainLines, 'total' => $bebanLain],
            'labaBersih' => $labaBersih,
        ];

        // ---- 3. NERACA ----
        $aktivaLines = $lineList('1', false); // debit-normal; akumulasi penyusutan otomatis jadi kontra (negatif)
        $kewajibanLines = $lineList('2', true);
        $ekuitasLines = $lineList('3', true);

        $totalAktiva = $aktivaLines->sum('amount');
        $totalKewajiban = $kewajibanLines->sum('amount');
        $totalEkuitasAkun = $ekuitasLines->sum('amount');
        $totalEkuitas = $totalEkuitasAkun + $labaBersih;
        $totalPasiva = $totalKewajiban + $totalEkuitas;

        $neraca = [
            'aktiva' => ['lines' => $aktivaLines, 'total' => $totalAktiva],
            'kewajiban' => ['lines' => $kewajibanLines, 'total' => $totalKewajiban],
            'ekuitas' => ['lines' => $ekuitasLines, 'total' => $totalEkuitasAkun],
            'labaBerjalan' => $labaBersih,
            'totalEkuitas' => $totalEkuitas,
            'totalAktiva' => $totalAktiva,
            'totalPasiva' => $totalPasiva,
            'balanced' => abs($totalAktiva - $totalPasiva) < 0.01,
        ];

        // ---- 4. TRIAL BALANCE (ringkasan per klasifikasi akun) ----
        $summary = collect($classNames)->map(fn ($name, $cls) => [
            'code' => $cls . '000',
            'name' => $name,
            'net' => $active->filter(fn ($r) => $r['class'] === (string) $cls)->sum('net'),
        ])->map(fn ($g) => [
            'code' => $g['code'],
            'name' => $g['name'],
            'debit' => $g['net'] > 0 ? $g['net'] : 0,
            'credit' => $g['net'] < 0 ? -$g['net'] : 0,
        ])->filter(fn ($g) => $g['debit'] > 0.001 || $g['credit'] > 0.001)->values();

        $trialBalance = [
            'rows' => $summary,
            'totalDebit' => $summary->sum('debit'),
            'totalCredit' => $summary->sum('credit'),
        ];

        return [
            'filters' => ['start_date' => $startDate, 'end_date' => $endDate],
            'neracaSaldo' => $neracaSaldo,
            'labaRugi' => $labaRugi,
            'neraca' => $neraca,
            'trialBalance' => $trialBalance,
        ];
    }
}
