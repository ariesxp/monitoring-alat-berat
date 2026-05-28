import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Show({ penerimaan }) {
    return (
        <AppLayout title="Detail Penerimaan">
            <Head title="Detail Penerimaan" />
            <Link href="/penerimaan-gudang" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div><dt className="text-gray-500">No. Penerimaan</dt><dd className="font-medium font-mono">{penerimaan.nomor_penerimaan}</dd></div>
                    <div><dt className="text-gray-500">Tanggal</dt><dd className="font-medium">{new Date(penerimaan.tanggal_terima).toLocaleDateString('id-ID')}</dd></div>
                    <div><dt className="text-gray-500">Supplier</dt><dd className="font-medium">{penerimaan.supplier}</dd></div>
                </dl>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Detail Barang</h3>
                <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500">Barang</th><th className="text-left py-2 px-3 text-gray-500">Jumlah</th><th className="text-left py-2 px-3 text-gray-500">Harga Satuan</th><th className="text-left py-2 px-3 text-gray-500">Total</th></tr></thead>
                    <tbody>{(penerimaan.details || []).map(d => (
                        <tr key={d.id} className="border-b border-gray-50"><td className="py-2 px-3">{d.barang?.nama_barang}</td><td className="py-2 px-3">{d.jumlah} {d.barang?.satuan}</td><td className="py-2 px-3">{formatRp(d.harga_satuan)}</td><td className="py-2 px-3 font-medium">{formatRp(d.total_harga)}</td></tr>
                    ))}</tbody>
                </table>
            </div>
        </AppLayout>
    );
}
