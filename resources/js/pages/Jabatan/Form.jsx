import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ jabatan }) {
    const isEdit = !!jabatan;
    const { data, setData, post, put, processing, errors } = useForm({
        kode_jabatan: jabatan?.kode_jabatan || '',
        nama_jabatan: jabatan?.nama_jabatan || '',
        keterangan: jabatan?.keterangan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/jabatan/${jabatan.id}`) : post('/jabatan');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'}>
            <Head title={isEdit ? 'Edit Jabatan' : 'Tambah Jabatan'} />
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Jabatan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_jabatan} onChange={(e) => setData('kode_jabatan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="JBT-01" />
                            {errors.kode_jabatan && <p className="text-red-500 text-xs mt-1">{errors.kode_jabatan}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jabatan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_jabatan} onChange={(e) => setData('nama_jabatan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Operator Excavator" />
                            {errors.nama_jabatan && <p className="text-red-500 text-xs mt-1">{errors.nama_jabatan}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                        <textarea value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Deskripsi singkat (opsional)" />
                        {errors.keterangan && <p className="text-red-500 text-xs mt-1">{errors.keterangan}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/jabatan" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
