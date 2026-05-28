import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

export default function Form({ barangList, spkList, alatBerat }) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_keluar: new Date().toISOString().split('T')[0],
        spk_id: '', alat_berat_id: '', tujuan: '', catatan: '',
        items: [{ barang_id: '', jumlah: '' }],
    });

    const addItem = () => setData('items', [...data.items, { barang_id: '', jumlah: '' }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, value) => { const updated = [...data.items]; updated[i][field] = value; setData('items', updated); };

    return (
        <AppLayout title="Tambah Pengeluaran Gudang">
            <Head title="Tambah Pengeluaran" />
            <form onSubmit={(e) => { e.preventDefault(); post('/pengeluaran-gudang'); }} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Keluar</label><input type="date" value={data.tanggal_keluar} onChange={(e) => setData('tanggal_keluar', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tujuan <span className="text-red-500">*</span></label><input value={data.tujuan} onChange={(e) => setData('tujuan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">SPK</label><select value={data.spk_id} onChange={(e) => setData('spk_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">-- Opsional --</option>{(spkList || []).map(s => <option key={s.id} value={s.id}>{s.nomor_spk}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Alat Berat</label><select value={data.alat_berat_id} onChange={(e) => setData('alat_berat_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"><option value="">-- Opsional --</option>{(alatBerat || []).map(a => <option key={a.id} value={a.id}>{a.kode_alat} - {a.nama_alat}</option>)}</select></div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2"><h3 className="text-sm font-semibold text-gray-700">Detail Barang</h3><button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-blue-600"><Plus className="w-4 h-4" /> Tambah</button></div>
                    {data.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div><label className="block text-xs text-gray-500 mb-1">Barang</label><select value={item.barang_id} onChange={(e) => updateItem(i, 'barang_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"><option value="">Pilih</option>{barangList.map(b => <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang} (stok: {b.stok_saat_ini})</option>)}</select></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Jumlah</label><input type="number" step="0.01" value={item.jumlah} onChange={(e) => updateItem(i, 'jumlah', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></div>
                            <div className="flex items-end"><button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                    <Link href="/pengeluaran-gudang" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
