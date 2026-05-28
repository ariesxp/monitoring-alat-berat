import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show({ pengeluaran }) {
    return (
        <AppLayout title="Detail Pengeluaran">
            <Head title="Detail Pengeluaran" />
            <Link href="/pengeluaran-gudang" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div><dt className="text-gray-500">No. Pengeluaran</dt><dd className="font-medium font-mono">{pengeluaran.nomor_pengeluaran}</dd></div>
                    <div><dt className="text-gray-500">Tanggal</dt><dd className="font-medium">{new Date(pengeluaran.tanggal_keluar).toLocaleDateString('id-ID')}</dd></div>
                    <div><dt className="text-gray-500">Tujuan</dt><dd className="font-medium">{pengeluaran.tujuan}</dd></div>
                    {pengeluaran.spk && <div><dt className="text-gray-500">SPK</dt><dd className="font-medium">{pengeluaran.spk.nomor_spk}</dd></div>}
                    {pengeluaran.alat_berat && <div><dt className="text-gray-500">Alat</dt><dd className="font-medium">{pengeluaran.alat_berat.nama_alat}</dd></div>}
                </dl>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Detail Barang</h3>
                <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500">Barang</th><th className="text-left py-2 px-3 text-gray-500">Jumlah</th></tr></thead>
                    <tbody>{(pengeluaran.details || []).map(d => (
                        <tr key={d.id} className="border-b border-gray-50"><td className="py-2 px-3">{d.barang?.nama_barang}</td><td className="py-2 px-3">{d.jumlah} {d.barang?.satuan}</td></tr>
                    ))}</tbody>
                </table>
            </div>
        </AppLayout>
    );
}
