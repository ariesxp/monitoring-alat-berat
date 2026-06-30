import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ role, permissions }) {
    const isEdit = !!role;
    const { data, setData, post, put, processing, errors } = useForm({
        name: role?.name || '',
        slug: role?.slug || '',
        description: role?.description || '',
        permissions: role?.permissions || [],
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/role/${role.id}`) : post('/role');
    };

    const togglePermission = (id) => {
        setData('permissions', data.permissions.includes(id)
            ? data.permissions.filter((p) => p !== id)
            : [...data.permissions, id]);
    };

    // Kelompokkan permissions berdasarkan group
    const grouped = permissions.reduce((acc, p) => {
        const g = p.group || 'Lainnya';
        (acc[g] = acc[g] || []).push(p);
        return acc;
    }, {});

    const toggleGroup = (items, allChecked) => {
        const ids = items.map((p) => p.id);
        setData('permissions', allChecked
            ? data.permissions.filter((p) => !ids.includes(p))
            : [...new Set([...data.permissions, ...ids])]);
    };

    return (
        <AppLayout title={isEdit ? 'Edit Role' : 'Tambah Role'}>
            <Head title={isEdit ? 'Edit Role' : 'Tambah Role'} />
            <div className="max-w-3xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Role <span className="text-red-500">*</span></label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Manajer Gudang" />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Slug <span className="text-gray-400 font-normal">(otomatis bila kosong)</span>
                            </label>
                            <input type="text" value={data.slug} onChange={(e) => setData('slug', e.target.value)} disabled={role?.is_locked} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 font-mono" placeholder="manajer-gudang" />
                            {role?.is_locked && <p className="text-gray-400 text-xs mt-1">Slug role inti tidak dapat diubah.</p>}
                            {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hak Akses (Permissions)</label>
                        {permissions.length === 0 && <p className="text-sm text-gray-400">Belum ada permission. Tambahkan di modul Permissions terlebih dahulu.</p>}
                        <div className="space-y-4">
                            {Object.entries(grouped).map(([group, items]) => {
                                const allChecked = items.every((p) => data.permissions.includes(p.id));
                                return (
                                    <div key={group} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{group}</span>
                                            <button type="button" onClick={() => toggleGroup(items, allChecked)} className="text-xs text-blue-600 hover:underline">
                                                {allChecked ? 'Hapus semua' : 'Pilih semua'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {items.map((p) => (
                                                <label key={p.id} className="flex items-start gap-2 text-sm cursor-pointer">
                                                    <input type="checkbox" checked={data.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                    <span>
                                                        <span className="text-gray-700">{p.name}</span>
                                                        <span className="block text-xs text-gray-400 font-mono">{p.slug}</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/role" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
