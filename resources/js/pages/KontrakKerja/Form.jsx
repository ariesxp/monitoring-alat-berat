import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

export default function Form({ kontrak, clients, alatBerat, operators }) {
    const isEdit = !!kontrak;
    const { data, setData, post, put, processing, errors } = useForm({
        nomor_kontrak: kontrak?.nomor_kontrak || '',
        client_id: kontrak?.client_id || '',
        nama_proyek: kontrak?.nama_proyek || '',
        lokasi_proyek: kontrak?.lokasi_proyek || '',
        deskripsi: kontrak?.deskripsi || '',
        tanggal_mulai: kontrak?.tanggal_mulai?.split('T')[0] || '',
        tanggal_selesai: kontrak?.tanggal_selesai?.split('T')[0] || '',
        nilai_kontrak: kontrak?.nilai_kontrak || '',
        catatan: kontrak?.catatan || '',
        alat: kontrak?.kontrak_alat?.map(a => ({
            alat_berat_id: a.alat_berat_id,
            operator_id: a.operator_id || '',
            tarif_harian: a.tarif_harian,
            tarif_bulanan: a.tarif_bulanan || '',
        })) || [],
    });

    const addAlat = () => setData('alat', [...data.alat, { alat_berat_id: '', operator_id: '', tarif_harian: '', tarif_bulanan: '' }]);
    const removeAlat = (i) => setData('alat', data.alat.filter((_, idx) => idx !== i));
    const updateAlat = (i, field, value) => {
        const updated = [...data.alat];
        updated[i][field] = value;
        setData('alat', updated);
    };

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/kontrak-kerja/${kontrak.id}`) : post('/kontrak-kerja');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Kontrak' : 'Buat Kontrak Kerja'}>
            <Head title={isEdit ? 'Edit Kontrak' : 'Buat Kontrak Kerja'} />
            <form onSubmit={submit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Informasi Kontrak</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Nomor Kontrak', name: 'nomor_kontrak', required: true },
                            { label: 'Nama Proyek', name: 'nama_proyek', required: true },
                            { label: 'Lokasi Proyek', name: 'lokasi_proyek', required: true },
                            { label: 'Nilai Kontrak (Rp)', name: 'nilai_kontrak', type: 'number', required: true },
                            { label: 'Tanggal Mulai', name: 'tanggal_mulai', type: 'date', required: true },
                            { label: 'Tanggal Selesai', name: 'tanggal_selesai', type: 'date', required: true },
                        ].map(({ label, name, type = 'text', required }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                                <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client <span className="text-red-500">*</span></label>
                            <select value={data.client_id} onChange={(e) => setData('client_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Pilih Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.nama_perusahaan}</option>)}
                            </select>
                            {errors.client_id && <p className="text-red-500 text-xs mt-1">{errors.client_id}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold text-gray-700">Alat Berat yang Ditugaskan</h3>
                        <button type="button" onClick={addAlat} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><Plus className="w-4 h-4" /> Tambah Alat</button>
                    </div>
                    {data.alat.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Alat Berat</label>
                                <select value={item.alat_berat_id} onChange={(e) => updateAlat(i, 'alat_berat_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                    <option value="">Pilih Alat</option>
                                    {alatBerat.map(a => <option key={a.id} value={a.id}>{a.kode_alat} - {a.nama_alat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Operator</label>
                                <select value={item.operator_id} onChange={(e) => updateAlat(i, 'operator_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm">
                                    <option value="">Pilih Operator</option>
                                    {operators.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tarif Harian</label>
                                <input type="number" value={item.tarif_harian} onChange={(e) => updateAlat(i, 'tarif_harian', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tarif Bulanan</label>
                                <input type="number" value={item.tarif_bulanan} onChange={(e) => updateAlat(i, 'tarif_bulanan', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                            </div>
                            <div className="flex items-end">
                                <button type="button" onClick={() => removeAlat(i)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                    {data.alat.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Belum ada alat ditugaskan</p>}
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                    <Link href="/kontrak-kerja" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
