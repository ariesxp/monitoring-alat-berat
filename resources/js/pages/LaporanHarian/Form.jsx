import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';

export default function Form({ laporan, spkList }) {
    const isEdit = !!laporan;
    const { data, setData, post, put, processing, errors } = useForm({
        spk_id: laporan?.spk_id || '',
        tanggal: laporan?.tanggal?.split('T')[0] || new Date().toISOString().split('T')[0],
        jam_mulai: laporan?.jam_mulai?.substring(0, 5) || '08:00',
        jam_selesai: laporan?.jam_selesai?.substring(0, 5) || '17:00',
        bbm_liter: laporan?.bbm_liter || '',
        hm_awal: laporan?.hm_awal || '',
        hm_akhir: laporan?.hm_akhir || '',
        km_awal: laporan?.km_awal || '',
        km_akhir: laporan?.km_akhir || '',
        jenis_pekerjaan: laporan?.jenis_pekerjaan || '',
        volume_pekerjaan: laporan?.volume_pekerjaan || '',
        satuan_volume: laporan?.satuan_volume || '',
        kondisi_alat: laporan?.kondisi_alat || 'baik',
        catatan: laporan?.catatan || '',
        foto_awal: null,
        foto_akhir: null,
    });

    const selectedSpk = spkList?.find(s => s.id == data.spk_id);

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            // Inertia PUT + file upload perlu method spoofing lewat POST.
            router.post(`/laporan-harian/${laporan.id}`, { ...data, _method: 'put' }, { forceFormData: true });
        } else {
            post('/laporan-harian', { forceFormData: true });
        }
    };

    return (
        <AppLayout title={isEdit ? 'Edit Laporan' : 'Buat Laporan Harian'}>
            <Head title={isEdit ? 'Edit Laporan' : 'Buat Laporan Harian'} />
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SPK <span className="text-red-500">*</span></label>
                        <select value={data.spk_id} onChange={(e) => setData('spk_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="">Pilih SPK</option>
                            {(spkList || []).map(s => <option key={s.id} value={s.id}>{s.nomor_spk} - {s.alat_berat?.nama_alat} ({s.operator?.nama})</option>)}
                        </select>
                        {errors.spk_id && <p className="text-red-500 text-xs mt-1">{errors.spk_id}</p>}
                    </div>
                    {selectedSpk && <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">Alat: {selectedSpk.alat_berat?.nama_alat} | Operator: {selectedSpk.operator?.nama}</div>}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />{errors.tanggal && <p className="text-red-500 text-xs mt-1">{errors.tanggal}</p>}</div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label><input type="time" value={data.jam_mulai} onChange={(e) => setData('jam_mulai', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label><input type="time" value={data.jam_selesai} onChange={(e) => setData('jam_selesai', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'BBM (liter)', name: 'bbm_liter' },
                            { label: 'HM Awal', name: 'hm_awal' },
                            { label: 'HM Akhir', name: 'hm_akhir' },
                            { label: 'Jenis Pekerjaan', name: 'jenis_pekerjaan', type: 'text' },
                        ].map(({ label, name, type = 'number' }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Alat</label>
                        <select value={data.kondisi_alat} onChange={(e) => setData('kondisi_alat', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                            <option value="baik">Baik</option>
                            <option value="kurang_baik">Kurang Baik</option>
                            <option value="rusak">Rusak</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                        <textarea value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Awal</label>
                            <input type="file" accept="image/*" onChange={(e) => setData('foto_awal', e.target.files[0])} className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            {laporan?.foto_awal && <p className="text-xs text-gray-400 mt-1">Foto awal sudah ada — pilih file baru untuk mengganti.</p>}
                            {errors.foto_awal && <p className="text-red-500 text-xs mt-1">{errors.foto_awal}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Akhir</label>
                            <input type="file" accept="image/*" onChange={(e) => setData('foto_akhir', e.target.files[0])} className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            {laporan?.foto_akhir && <p className="text-xs text-gray-400 mt-1">Foto akhir sudah ada — pilih file baru untuk mengganti.</p>}
                            {errors.foto_akhir && <p className="text-red-500 text-xs mt-1">{errors.foto_akhir}</p>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/laporan-harian" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
