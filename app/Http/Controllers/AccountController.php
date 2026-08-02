<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\FinancialStatementType;
use App\Models\MainAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        $query = Account::with('mainAccount', 'financialStatementType', 'parent');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('account_number', 'like', "%{$search}%")
                  ->orWhere('account_description', 'like', "%{$search}%")
                  ->orWhereHas('mainAccount', fn ($q2) => $q2->where('name', 'like', "%{$search}%"));
            });
        }

        if ($typeId = $request->get('financial_statement_type_id')) {
            $query->where('financial_statement_type_id', $typeId);
        }

        // Tampil sebagai pohon: urut nomor akun sudah menghasilkan urutan hierarki alami.
        return Inertia::render('Account/Index', [
            'accounts' => $query->orderBy('account_number')->get(),
            'filters' => $request->only(['search', 'financial_statement_type_id']),
            'financialStatementTypes' => FinancialStatementType::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Account/Form', $this->formOptions());
    }

    public function store(Request $request)
    {
        $validated = $this->validateAccount($request);

        Account::create($validated);

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil ditambahkan.');
    }

    public function edit(Account $account)
    {
        return Inertia::render('Account/Form', array_merge(
            ['account' => $account],
            $this->formOptions($account),
        ));
    }

    public function update(Request $request, Account $account)
    {
        $validated = $this->validateAccount($request, $account);

        $account->update($validated);

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil diperbarui.');
    }

    public function destroy(Account $account)
    {
        if ($account->children()->exists()) {
            return redirect()->route('account.index')
                ->with('error', 'Account tidak dapat dihapus karena masih memiliki sub-account.');
        }

        if ($account->pettyCashDetails()->exists()) {
            return redirect()->route('account.index')
                ->with('error', 'Account tidak dapat dihapus karena masih digunakan di Kas & Bank.');
        }

        $account->delete();

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil dihapus.');
    }

    private function formOptions(?Account $account = null): array
    {
        // Kandidat parent: header (level 1) & grup (level 2), kecuali dirinya sendiri.
        $parentAccounts = Account::whereIn('level', [1, 2])
            ->when($account, fn ($q) => $q->where('id', '!=', $account->id))
            ->orderBy('account_number')
            ->get(['id', 'account_number', 'account_description', 'level']);

        return [
            'parentAccounts' => $parentAccounts,
            'mainAccounts' => MainAccount::orderBy('code')->get(['id', 'code', 'name']),
            'financialStatementTypes' => FinancialStatementType::orderBy('name')->get(['id', 'code', 'name']),
        ];
    }

    private function validateAccount(Request $request, ?Account $account = null): array
    {
        $unique = 'unique:accounts,account_number' . ($account ? ',' . $account->id : '');

        $validated = $request->validate([
            'account_number' => "required|string|max:20|{$unique}",
            'account_description' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:accounts,id',
            'level' => 'required|integer|min:1|max:5',
            'main_account_id' => 'nullable|exists:main_accounts,id',
            'account_type' => 'nullable|in:Sale,Cost,Activa,Pasiva,Expense',
            'financial_statement_type_id' => 'nullable|exists:financial_statement_types,id',
            'is_active' => 'boolean',
        ]);

        // Akun tidak boleh menjadi parent-nya sendiri.
        if ($account && (int) ($validated['parent_id'] ?? 0) === $account->id) {
            $validated['parent_id'] = null;
        }

        return $validated;
    }
}
