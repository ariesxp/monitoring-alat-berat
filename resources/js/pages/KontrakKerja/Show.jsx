import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Show({ kontrak }) {
    const { auth } = usePage().props;
    const canApprove = ['admin', 'supervisor'].includes(auth.user.role) && kontrak.status === 'draft';

    return (
        <AppLayout title="Detail Kontrak Kerja">
            <Head title={kontrak.nama_proyek} />
            <div className="flex gap-3 mb-4">
                <Link href="/kontrak-kerja" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                {canApprove && (
                    <button onClick={() => router.post(`/kontrak-kerja/${kontrak.id}/approve`)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"><CheckCircle className="w-4 h-4" /> Setujui Kontrak</button>
                )}
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">{kontrak.nama_proyek}</h2>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><dt className="text-gray-500">No. Kontrak</dt><dd className="font-medium font-mono">{kontrak.nomor_kontrak}</dd></div>
                        <div><dt className="text-gray-500">Client</dt><dd className="font-medium">{kontrak.client?.nama_perusahaan}</dd></div>
                        <div><dt className="text-gray-500">Lokasi</dt><dd className="font-medium">{kontrak.lokasi_proyek}</dd></div>
                        <div><dt className="text-gray-500">Nilai Kontrak</dt><dd className="font-medium text-green-600">{formatRp(kontrak.nilai_kontrak)}</dd></div>
                        <div><dt className="text-gray-500">Periode</dt><dd className="font-medium">{new Date(kontrak.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(kontrak.tanggal_selesai).toLocaleDateString('id-ID')}</dd></div>
                        <div><dt className="text-gray-500">Status</dt><dd className="font-medium capitalize">{kontrak.status}</dd></div>
                        {kontrak.approved_by_user && <div><dt className="text-gray-500">Disetujui Oleh</dt><dd className="font-medium">{kontrak.approved_by_user.name}</dd></div>}
                    </dl>
                </div>

                {kontrak.kontrak_alat?.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Alat Berat Ditugaskan</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b"><th className="text-left py-2 px-3 text-gray-500">Alat</th><th className="text-left py-2 px-3 text-gray-500">Operator</th><th className="text-left py-2 px-3 text-gray-500">Tarif Harian</th><th className="text-left py-2 px-3 text-gray-500">Tarif Bulanan</th></tr></thead>
                                <tbody>
                                    {kontrak.kontrak_alat.map(ka => (
                                        <tr key={ka.id} className="border-b border-gray-50">
                                            <td className="py-2 px-3">{ka.alat_berat?.nama_alat}</td>
                                            <td className="py-2 px-3">{ka.operator?.nama || '-'}</td>
                                            <td className="py-2 px-3">{formatRp(ka.tarif_harian)}</td>
                                            <td className="py-2 px-3">{ka.tarif_bulanan ? formatRp(ka.tarif_bulanan) : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
