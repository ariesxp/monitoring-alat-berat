import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ golongan }) {
    const isEdit = !!golongan;
    const { data, setData, post, put, processing, errors } = useForm({
        kode_golongan: golongan?.kode_golongan || '',
        nama_golongan: golongan?.nama_golongan || '',
        gaji_golongan: golongan?.gaji_golongan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/golongan/${golongan.id}`) : post('/golongan');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Golongan' : 'Tambah Golongan'}>
            <Head title={isEdit ? 'Edit Golongan' : 'Tambah Golongan'} />
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Golongan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_golongan} onChange={(e) => setData('kode_golongan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="GOL-01" />
                            {errors.kode_golongan && <p className="text-red-500 text-xs mt-1">{errors.kode_golongan}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Golongan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_golongan} onChange={(e) => setData('nama_golongan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {errors.nama_golongan && <p className="text-red-500 text-xs mt-1">{errors.nama_golongan}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Golongan <span className="text-red-500">*</span></label>
                        <input type="number" value={data.gaji_golongan} onChange={(e) => setData('gaji_golongan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" min="0" step="1000" />
                        {errors.gaji_golongan && <p className="text-red-500 text-xs mt-1">{errors.gaji_golongan}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/golongan" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
