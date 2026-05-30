<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\PettyCash;
use App\Models\PettyCashDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PettyCashController extends Controller
{
    public function index(Request $request)
    {
        $query = PettyCash::with('creator')
            ->withCount('details')
            ->withSum('details', 'debit')
            ->withSum('details', 'credit');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('voucher_number', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($from = $request->get('from_date')) {
            $query->where('posting_date', '>=', $from);
        }
        if ($to = $request->get('to_date')) {
            $query->where('posting_date', '<=', $to);
        }

        $pettyCash = $query->orderByDesc('posting_date')->orderByDesc('id')->paginate(15)->withQueryString();

        $totalDebit = PettyCashDetail::sum('debit');
        $totalCredit = PettyCashDetail::sum('credit');

        return Inertia::render('PettyCash/Index', [
            'pettyCash' => $pettyCash,
            'filters' => $request->only(['search', 'from_date', 'to_date']),
            'summary' => [
                'total_debit' => $totalDebit,
                'total_credit' => $totalCredit,
                'balance' => $totalDebit - $totalCredit,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('PettyCash/Form', [
            'accounts' => Account::where('is_active', true)->orderBy('account_number')->get(['id', 'account_number', 'account_description']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'posting_date' => 'required|date',
            'voucher_number' => 'required|string|max:50|unique:petty_cash,voucher_number',
            'description' => 'required|string|max:255',
            'remark' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'required|string|max:255',
            'details.*.remark' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.credit' => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($validated['details'])->sum('debit');
        $totalCredit = collect($validated['details'])->sum('credit');

        if (bccomp((string) $totalDebit, (string) $totalCredit, 2) !== 0) {
            return back()->withErrors([
                'details' => 'Total Debit dan Credit harus balance. Selisih: ' .
                    number_format(abs($totalDebit - $totalCredit), 2, ',', '.'),
            ])->withInput();
        }

        DB::transaction(function () use ($validated) {
            $pettyCash = PettyCash::create([
                'posting_date' => $validated['posting_date'],
                'voucher_number' => $validated['voucher_number'],
                'description' => $validated['description'],
                'remark' => $validated['remark'] ?? null,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['details'] as $detail) {
                $pettyCash->details()->create($detail);
            }
        });

        return redirect()->route('petty-cash.index')
            ->with('success', 'Petty Cash berhasil ditambahkan.');
    }

    public function show(PettyCash $pettyCash)
    {
        $pettyCash->load('details.account', 'creator');

        return Inertia::render('PettyCash/Show', [
            'pettyCash' => $pettyCash,
        ]);
    }

    public function edit(PettyCash $pettyCash)
    {
        $pettyCash->load('details');

        return Inertia::render('PettyCash/Form', [
            'pettyCash' => $pettyCash,
            'accounts' => Account::where('is_active', true)->orderBy('account_number')->get(['id', 'account_number', 'account_description']),
        ]);
    }

    public function update(Request $request, PettyCash $pettyCash)
    {
        $validated = $request->validate([
            'posting_date' => 'required|date',
            'voucher_number' => 'required|string|max:50|unique:petty_cash,voucher_number,' . $pettyCash->id,
            'description' => 'required|string|max:255',
            'remark' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.account_id' => 'required|exists:accounts,id',
            'details.*.description' => 'required|string|max:255',
            'details.*.remark' => 'nullable|string',
            'details.*.debit' => 'required|numeric|min:0',
            'details.*.credit' => 'required|numeric|min:0',
        ]);

        $totalDebit = collect($validated['details'])->sum('debit');
        $totalCredit = collect($validated['details'])->sum('credit');

        if (bccomp((string) $totalDebit, (string) $totalCredit, 2) !== 0) {
            return back()->withErrors([
                'details' => 'Total Debit dan Credit harus balance. Selisih: ' .
                    number_format(abs($totalDebit - $totalCredit), 2, ',', '.'),
            ])->withInput();
        }

        DB::transaction(function () use ($validated, $pettyCash) {
            $pettyCash->update([
                'posting_date' => $validated['posting_date'],
                'voucher_number' => $validated['voucher_number'],
                'description' => $validated['description'],
                'remark' => $validated['remark'] ?? null,
            ]);

            $pettyCash->details()->delete();

            foreach ($validated['details'] as $detail) {
                $pettyCash->details()->create($detail);
            }
        });

        return redirect()->route('petty-cash.index')
            ->with('success', 'Petty Cash berhasil diperbarui.');
    }

    public function destroy(PettyCash $pettyCash)
    {
        $pettyCash->delete();

        return redirect()->route('petty-cash.index')
            ->with('success', 'Petty Cash berhasil dihapus.');
    }
}
