<?php

namespace App\Http\Controllers;

use App\Models\MainAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainAccountController extends Controller
{
    public function index(Request $request)
    {
        $query = MainAccount::withCount('accounts');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('MainAccount/Index', [
            'mainAccounts' => $query->orderBy('code')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('MainAccount/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:main_accounts,code',
            'name' => 'required|string|max:255',
        ]);

        MainAccount::create($validated);

        return redirect()->route('main-account.index')
            ->with('success', 'Main Account berhasil ditambahkan.');
    }

    public function edit(MainAccount $mainAccount)
    {
        return Inertia::render('MainAccount/Form', [
            'mainAccount' => $mainAccount,
        ]);
    }

    public function update(Request $request, MainAccount $mainAccount)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:20|unique:main_accounts,code,' . $mainAccount->id,
            'name' => 'required|string|max:255',
        ]);

        $mainAccount->update($validated);

        return redirect()->route('main-account.index')
            ->with('success', 'Main Account berhasil diperbarui.');
    }

    public function destroy(MainAccount $mainAccount)
    {
        if ($mainAccount->accounts()->exists()) {
            return redirect()->route('main-account.index')
                ->with('error', 'Main Account tidak dapat dihapus karena masih digunakan di Chart of Account.');
        }

        $mainAccount->delete();

        return redirect()->route('main-account.index')
            ->with('success', 'Main Account berhasil dihapus.');
    }
}
