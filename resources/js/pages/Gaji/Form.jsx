import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Form() {
    const now = new Date();
    const periode = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const { data, setData, post, processing, errors } = useForm({
        periode: periode,
        tanggal_mulai: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`,
        tanggal_selesai: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0],
        catatan: '',
    });

    return (
        <AppLayout title="Buat Periode Penggajian">
            <Head title="Buat Periode Gaji" />
            <div className="max-w-lg">
                <form onSubmit={(e) => { e.preventDefault(); post('/gaji'); }} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Periode</label><input value={data.periode} onChange={(e) => setData('periode', e.target.value)} placeholder="2026-05" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />{errors.periode && <p className="text-red-500 text-xs mt-1">{errors.periode}</p>}</div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label><input type="date" value={data.tanggal_mulai} onChange={(e) => setData('tanggal_mulai', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label><input type="date" value={data.tanggal_selesai} onChange={(e) => setData('tanggal_selesai', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label><textarea value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/gaji" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
