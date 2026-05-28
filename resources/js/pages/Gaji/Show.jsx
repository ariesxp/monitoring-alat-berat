import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calculator } from 'lucide-react';

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Show({ penggajian }) {
    const totalGaji = (penggajian.details || []).reduce((sum, d) => sum + parseFloat(d.total_gaji || 0), 0);

    return (
        <AppLayout title="Detail Penggajian">
            <Head title={`Gaji ${penggajian.periode}`} />
            <div className="flex gap-3 mb-4">
                <Link href="/gaji" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                {penggajian.status !== 'selesai' && (
                    <button onClick={() => router.post(`/gaji/${penggajian.id}/hitung`)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"><Calculator className="w-4 h-4" /> Hitung Gaji</button>
                )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <dl className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                    <div><dt className="text-gray-500">Periode</dt><dd className="font-medium text-lg">{penggajian.periode}</dd></div>
                    <div><dt className="text-gray-500">Tanggal</dt><dd className="font-medium">{new Date(penggajian.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(penggajian.tanggal_selesai).toLocaleDateString('id-ID')}</dd></div>
                    <div><dt className="text-gray-500">Status</dt><dd className="font-medium capitalize">{penggajian.status}</dd></div>
                    <div><dt className="text-gray-500">Total Gaji</dt><dd className="font-medium text-lg text-green-600">{formatRp(totalGaji)}</dd></div>
                </dl>
            </div>
            {(penggajian.details || []).length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Detail Per Karyawan</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead><tr className="border-b">
                                <th className="text-left py-2 px-3 text-gray-500">Nama</th>
                                <th className="text-right py-2 px-3 text-gray-500">Gaji Pokok</th>
                                <th className="text-right py-2 px-3 text-gray-500">Tunjangan</th>
                                <th className="text-center py-2 px-3 text-gray-500">Hari Kerja</th>
                                <th className="text-center py-2 px-3 text-gray-500">Hadir</th>
                                <th className="text-right py-2 px-3 text-gray-500">Potongan</th>
                                <th className="text-right py-2 px-3 text-gray-500 font-semibold">Total</th>
                            </tr></thead>
                            <tbody>{penggajian.details.map(d => (
                                <tr key={d.id} className="border-b border-gray-50">
                                    <td className="py-2 px-3 font-medium">{d.operator?.nama}</td>
                                    <td className="py-2 px-3 text-right">{formatRp(d.gaji_pokok)}</td>
                                    <td className="py-2 px-3 text-right">{formatRp(d.tunjangan)}</td>
                                    <td className="py-2 px-3 text-center">{d.hari_kerja}</td>
                                    <td className="py-2 px-3 text-center">{d.hari_hadir}</td>
                                    <td className="py-2 px-3 text-right text-red-600">{formatRp(d.potongan)}</td>
                                    <td className="py-2 px-3 text-right font-semibold">{formatRp(d.total_gaji)}</td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
