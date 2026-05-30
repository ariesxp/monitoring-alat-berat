import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ type }) {
    const isEdit = !!type;
    const { data, setData, post, put, processing, errors } = useForm({
        code: type?.code || '',
        name: type?.name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/financial-statement-type/${type.id}`) : post('/financial-statement-type');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Financial Statement Type' : 'Tambah Financial Statement Type'}>
            <Head title={isEdit ? 'Edit Financial Statement Type' : 'Tambah Financial Statement Type'} />
            <div className="max-w-lg">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode <span className="text-red-500">*</span></label>
                        <input type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="CA" />
                        {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                        <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="CURRENT ASSET" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/financial-statement-type" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
