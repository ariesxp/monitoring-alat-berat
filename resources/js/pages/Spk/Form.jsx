import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ spk, kontrak, alatBerat, operators }) {
    const isEdit = !!spk;
    const { data, setData, post, put, processing, errors } = useForm({
        nomor_spk: spk?.nomor_spk || '',
        kontrak_kerja_id: spk?.kontrak_kerja_id || '',
        alat_berat_id: spk?.alat_berat_id || '',
        operator_id: spk?.operator_id || '',
        tanggal_spk: spk?.tanggal_spk?.split('T')[0] || new Date().toISOString().split('T')[0],
        tanggal_mulai: spk?.tanggal_mulai?.split('T')[0] || '',
        tanggal_selesai: spk?.tanggal_selesai?.split('T')[0] || '',
        jenis_pekerjaan: spk?.jenis_pekerjaan || '',
        lokasi_kerja: spk?.lokasi_kerja || '',
        deskripsi: spk?.deskripsi || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/spk/${spk.id}`) : post('/spk');
    };

    return (
        <AppLayout title={isEdit ? 'Edit SPK' : 'Buat SPK'}>
            <Head title={isEdit ? 'Edit SPK' : 'Buat SPK'} />
            <form onSubmit={submit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Informasi SPK</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SPK <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nomor_spk} onChange={(e) => setData('nomor_spk', e.target.value)} placeholder="Masukkan nomor SPK" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {errors.nomor_spk && <p className="text-red-500 text-xs mt-1">{errors.nomor_spk}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kontrak Kerja <span className="text-red-500">*</span></label>
                            <select value={data.kontrak_kerja_id} onChange={(e) => setData('kontrak_kerja_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Pilih Kontrak</option>
                                {kontrak.map(k => <option key={k.id} value={k.id}>{k.nomor_kontrak} - {k.nama_proyek}</option>)}
                            </select>
                            {errors.kontrak_kerja_id && <p className="text-red-500 text-xs mt-1">{errors.kontrak_kerja_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alat Berat <span className="text-red-500">*</span></label>
                            <select value={data.alat_berat_id} onChange={(e) => setData('alat_berat_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Pilih Alat</option>
                                {alatBerat.map(a => <option key={a.id} value={a.id}>{a.kode_alat} - {a.nama_alat}</option>)}
                            </select>
                            {errors.alat_berat_id && <p className="text-red-500 text-xs mt-1">{errors.alat_berat_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Operator <span className="text-red-500">*</span></label>
                            <select value={data.operator_id} onChange={(e) => setData('operator_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="">Pilih Operator</option>
                                {operators.map(o => <option key={o.id} value={o.id}>{o.nama} - {o.jabatan}</option>)}
                            </select>
                            {errors.operator_id && <p className="text-red-500 text-xs mt-1">{errors.operator_id}</p>}
                        </div>
                        {[
                            { label: 'Tanggal SPK', name: 'tanggal_spk', type: 'date', required: true },
                            { label: 'Tanggal Mulai', name: 'tanggal_mulai', type: 'date', required: true },
                            { label: 'Tanggal Selesai', name: 'tanggal_selesai', type: 'date' },
                            { label: 'Jenis Pekerjaan', name: 'jenis_pekerjaan', required: true },
                            { label: 'Lokasi Kerja', name: 'lokasi_kerja', required: true },
                        ].map(({ label, name, type = 'text', required }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                                <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                    <Link href="/spk" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
