import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function Show({ spk }) {
    const { auth } = usePage().props;
    const canApprove = ['admin', 'supervisor'].includes(auth.user.role) && spk.status === 'draft';
    const Info = ({ label, value }) => <div><dt className="text-sm text-gray-500">{label}</dt><dd className="text-sm font-medium text-gray-800 mt-0.5">{value || '-'}</dd></div>;

    return (
        <AppLayout title="Detail SPK">
            <Head title={spk.nomor_spk} />
            <div className="flex gap-3 mb-4">
                <Link href="/spk" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                {canApprove && <button onClick={() => router.post(`/spk/${spk.id}/approve`)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"><CheckCircle className="w-4 h-4" /> Setujui SPK</button>}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">{spk.nomor_spk}</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Info label="Kontrak" value={spk.kontrak_kerja?.nomor_kontrak} />
                    <Info label="Client" value={spk.kontrak_kerja?.client?.nama_perusahaan} />
                    <Info label="Alat Berat" value={spk.alat_berat?.nama_alat} />
                    <Info label="Operator" value={spk.operator?.nama} />
                    <Info label="Jenis Pekerjaan" value={spk.jenis_pekerjaan} />
                    <Info label="Lokasi" value={spk.lokasi_kerja} />
                    <Info label="Tanggal Mulai" value={spk.tanggal_mulai ? new Date(spk.tanggal_mulai).toLocaleDateString('id-ID') : '-'} />
                    <Info label="Status" value={spk.status} />
                </dl>
            </div>
            {spk.laporan_harian?.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Laporan Harian</h3>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500">Tanggal</th><th className="text-left py-2 px-3 text-gray-500">Jam Kerja</th><th className="text-left py-2 px-3 text-gray-500">BBM</th><th className="text-left py-2 px-3 text-gray-500">Kondisi</th></tr></thead>
                        <tbody>{spk.laporan_harian.map(l => (
                            <tr key={l.id} className="border-b border-gray-50"><td className="py-2 px-3">{new Date(l.tanggal).toLocaleDateString('id-ID')}</td><td className="py-2 px-3">{l.jam_kerja} jam</td><td className="py-2 px-3">{l.bbm_liter} ltr</td><td className="py-2 px-3">{l.kondisi_alat}</td></tr>
                        ))}</tbody>
                    </table>
                </div>
            )}
        </AppLayout>
    );
}
