import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form({ client }) {
    const isEdit = !!client;
    const { data, setData, post, put, processing, errors } = useForm({
        nama_perusahaan: client?.nama_perusahaan || '',
        nama_pic: client?.nama_pic || '',
        no_hp_pic: client?.no_hp_pic || '',
        email: client?.email || '',
        alamat: client?.alamat || '',
        npwp: client?.npwp || '',
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/client/${client.id}`) : post('/client');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Client' : 'Tambah Client'}>
            <Head title={isEdit ? 'Edit Client' : 'Tambah Client'} />
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'Nama Perusahaan', name: 'nama_perusahaan', required: true },
                            { label: 'Nama PIC', name: 'nama_pic', required: true },
                            { label: 'No. HP PIC', name: 'no_hp_pic' },
                            { label: 'Email', name: 'email', type: 'email' },
                            { label: 'NPWP', name: 'npwp' },
                        ].map(({ label, name, type = 'text', required }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
                                <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/client" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
