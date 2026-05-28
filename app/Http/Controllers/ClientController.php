<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_perusahaan', 'like', "%{$search}%")
                  ->orWhere('nama_pic', 'like', "%{$search}%");
            });
        }

        return Inertia::render('Client/Index', [
            'clients' => $query->orderByDesc('created_at')->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Client/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_perusahaan' => 'required|string|max:255',
            'nama_pic' => 'required|string|max:255',
            'no_hp_pic' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'alamat' => 'nullable|string',
            'npwp' => 'nullable|string|max:30',
        ]);

        Client::create($validated);

        return redirect()->route('client.index')
            ->with('success', 'Client berhasil ditambahkan.');
    }

    public function edit(Client $client)
    {
        return Inertia::render('Client/Form', [
            'client' => $client,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'nama_perusahaan' => 'required|string|max:255',
            'nama_pic' => 'required|string|max:255',
            'no_hp_pic' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'alamat' => 'nullable|string',
            'npwp' => 'nullable|string|max:30',
        ]);

        $client->update($validated);

        return redirect()->route('client.index')
            ->with('success', 'Client berhasil diperbarui.');
    }

    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('client.index')
            ->with('success', 'Client berhasil dihapus.');
    }
}
