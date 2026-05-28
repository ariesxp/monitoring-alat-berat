import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

export default function Form({ barangList }) {
    const { data, setData, post, processing, errors } = useForm({
        tanggal_terima: new Date().toISOString().split('T')[0],
        supplier: '',
        nomor_surat_jalan: '',
        catatan: '',
        items: [{ barang_id: '', jumlah: '', harga_satuan: '' }],
    });

    const addItem = () => setData('items', [...data.items, { barang_id: '', jumlah: '', harga_satuan: '' }]);
    const removeItem = (i) => setData('items', data.items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, value) => {
        const updated = [...data.items];
        updated[i][field] = value;
        if (field === 'barang_id') {
            const brg = barangList.find(b => b.id == value);
            if (brg) updated[i].harga_satuan = brg.harga_satuan;
        }
        setData('items', updated);
    };

    return (
        <AppLayout title="Tambah Penerimaan Gudang">
            <Head title="Tambah Penerimaan" />
            <form onSubmit={(e) => { e.preventDefault(); post('/penerimaan-gudang'); }} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Info Penerimaan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terima</label><input type="date" value={data.tanggal_terima} onChange={(e) => setData('tanggal_terima', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Supplier <span className="text-red-500">*</span></label><input value={data.supplier} onChange={(e) => setData('supplier', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />{errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">No. Surat Jalan</label><input value={data.nomor_surat_jalan} onChange={(e) => setData('nomor_surat_jalan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Detail Barang</h3>
                        <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-blue-600"><Plus className="w-4 h-4" /> Tambah</button>
                    </div>
                    {data.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Barang</label>
                                <select value={item.barang_id} onChange={(e) => updateItem(i, 'barang_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                    <option value="">Pilih Barang</option>
                                    {barangList.map(b => <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang}</option>)}
                                </select>
                            </div>
                            <div><label className="block text-xs text-gray-500 mb-1">Jumlah</label><input type="number" step="0.01" value={item.jumlah} onChange={(e) => updateItem(i, 'jumlah', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></div>
                            <div><label className="block text-xs text-gray-500 mb-1">Harga Satuan</label><input type="number" value={item.harga_satuan} onChange={(e) => updateItem(i, 'harga_satuan', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" /></div>
                            <div className="flex items-end"><button type="button" onClick={() => removeItem(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button></div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                    <Link href="/penerimaan-gudang" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
