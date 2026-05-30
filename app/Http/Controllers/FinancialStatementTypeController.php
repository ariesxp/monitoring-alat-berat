<?php

namespace App\Http\Controllers;

use App\Models\FinancialStatementType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FinancialStatementTypeController extends Controller
{
    public function index(Request $request)
    {
        $query = FinancialStatementType::withCount('accounts');

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('FinancialStatementType/Index', [
            'types' => $query->orderBy('code')->paginate(15)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('FinancialStatementType/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:financial_statement_types,code',
            'name' => 'required|string|max:255',
        ]);

        FinancialStatementType::create($validated);

        return redirect()->route('financial-statement-type.index')
            ->with('success', 'Financial Statement Type berhasil ditambahkan.');
    }

    public function edit(FinancialStatementType $financialStatementType)
    {
        return Inertia::render('FinancialStatementType/Form', [
            'type' => $financialStatementType,
        ]);
    }

    public function update(Request $request, FinancialStatementType $financialStatementType)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:30|unique:financial_statement_types,code,' . $financialStatementType->id,
            'name' => 'required|string|max:255',
        ]);

        $financialStatementType->update($validated);

        return redirect()->route('financial-statement-type.index')
            ->with('success', 'Financial Statement Type berhasil diperbarui.');
    }

    public function destroy(FinancialStatementType $financialStatementType)
    {
        if ($financialStatementType->accounts()->exists()) {
            return redirect()->route('financial-statement-type.index')
                ->with('error', 'Financial Statement Type tidak dapat dihapus karena masih digunakan di Chart of Account.');
        }

        $financialStatementType->delete();

        return redirect()->route('financial-statement-type.index')
            ->with('success', 'Financial Statement Type berhasil dihapus.');
    }
}
