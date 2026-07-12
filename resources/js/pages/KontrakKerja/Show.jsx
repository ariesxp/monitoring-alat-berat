import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Flag, XCircle, RotateCcw } from 'lucide-react';

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

const STATUS_BADGE = {
    draft: 'bg-gray-100 text-gray-600',
    aktif: 'bg-green-100 text-green-700',
    selesai: 'bg-blue-100 text-blue-700',
    dibatalkan: 'bg-red-100 text-red-700',
};

// Aksi status yang tersedia berdasarkan status kontrak saat ini.
const STATUS_ACTIONS = {
    draft: [
        { status: 'aktif', label: 'Aktifkan', icon: CheckCircle, className: 'text-green-600 hover:text-green-700' },
        { status: 'dibatalkan', label: 'Batalkan', icon: XCircle, className: 'text-red-600 hover:text-red-700' },
    ],
    aktif: [
        { status: 'selesai', label: 'Tandai Selesai', icon: Flag, className: 'text-blue-600 hover:text-blue-700' },
        { status: 'dibatalkan', label: 'Batalkan', icon: XCircle, className: 'text-red-600 hover:text-red-700' },
    ],
    selesai: [
        { status: 'aktif', label: 'Aktifkan Kembali', icon: RotateCcw, className: 'text-green-600 hover:text-green-700' },
    ],
    dibatalkan: [
        { status: 'draft', label: 'Kembalikan ke Draft', icon: RotateCcw, className: 'text-gray-600 hover:text-gray-700' },
    ],
};

export default function Show({ kontrak }) {
    const { auth } = usePage().props;
    const canManage = ['admin', 'supervisor'].includes(auth.user.role);
    const actions = STATUS_ACTIONS[kontrak.status] || [];

    const changeStatus = (status, label) => {
        if (confirm(`Ubah status kontrak menjadi "${label}"?`)) {
            router.patch(`/kontrak-kerja/${kontrak.id}/status`, { status });
        }
    };

    return (
        <AppLayout title="Detail Kontrak Kerja">
            <Head title={kontrak.nama_proyek} />
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link href="/kontrak-kerja" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                {canManage && actions.map(({ status, label, icon: Icon, className }) => (
                    <button key={status} onClick={() => changeStatus(status, label)} className={`flex items-center gap-1 text-sm font-medium ${className}`}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
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
                        <div><dt className="text-gray-500">Status</dt><dd><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[kontrak.status] || 'bg-gray-100 text-gray-600'}`}>{kontrak.status}</span></dd></div>
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
