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
        $query = Account::with('mainAccount', 'financialStatementType');

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

        return Inertia::render('Account/Index', [
            'accounts' => $query->orderBy('account_number')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'financial_statement_type_id']),
            'financialStatementTypes' => FinancialStatementType::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Account/Form', [
            'mainAccounts' => MainAccount::orderBy('name')->get(['id', 'code', 'name']),
            'financialStatementTypes' => FinancialStatementType::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_number' => 'required|string|max:20|unique:accounts,account_number',
            'account_description' => 'nullable|string|max:255',
            'main_account_id' => 'required|exists:main_accounts,id',
            'account_type' => 'nullable|in:Sale,Cost,Activa,Pasiva,Expense',
            'financial_statement_type_id' => 'required|exists:financial_statement_types,id',
            'is_active' => 'boolean',
        ]);

        Account::create($validated);

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil ditambahkan.');
    }

    public function edit(Account $account)
    {
        return Inertia::render('Account/Form', [
            'account' => $account,
            'mainAccounts' => MainAccount::orderBy('name')->get(['id', 'code', 'name']),
            'financialStatementTypes' => FinancialStatementType::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    public function update(Request $request, Account $account)
    {
        $validated = $request->validate([
            'account_number' => 'required|string|max:20|unique:accounts,account_number,' . $account->id,
            'account_description' => 'nullable|string|max:255',
            'main_account_id' => 'required|exists:main_accounts,id',
            'account_type' => 'nullable|in:Sale,Cost,Activa,Pasiva,Expense',
            'financial_statement_type_id' => 'required|exists:financial_statement_types,id',
            'is_active' => 'boolean',
        ]);

        $account->update($validated);

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil diperbarui.');
    }

    public function destroy(Account $account)
    {
        if ($account->pettyCashDetails()->exists()) {
            return redirect()->route('account.index')
                ->with('error', 'Account tidak dapat dihapus karena masih digunakan di Petty Cash.');
        }

        $account->delete();

        return redirect()->route('account.index')
            ->with('success', 'Account berhasil dihapus.');
    }
}
