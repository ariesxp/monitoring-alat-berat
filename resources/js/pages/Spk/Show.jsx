import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Play, Flag, XCircle, RotateCcw } from 'lucide-react';

const STATUS_BADGE = {
    draft: 'bg-gray-100 text-gray-600',
    disetujui: 'bg-green-100 text-green-700',
    berlangsung: 'bg-amber-100 text-amber-700',
    selesai: 'bg-blue-100 text-blue-700',
    dibatalkan: 'bg-red-100 text-red-700',
};

// Aksi status yang tersedia berdasarkan status SPK saat ini.
const STATUS_ACTIONS = {
    draft: [
        { status: 'disetujui', label: 'Setujui', icon: CheckCircle, className: 'text-green-600 hover:text-green-700' },
        { status: 'dibatalkan', label: 'Batalkan', icon: XCircle, className: 'text-red-600 hover:text-red-700' },
    ],
    disetujui: [
        { status: 'berlangsung', label: 'Mulai Kerjakan', icon: Play, className: 'text-amber-600 hover:text-amber-700' },
        { status: 'dibatalkan', label: 'Batalkan', icon: XCircle, className: 'text-red-600 hover:text-red-700' },
    ],
    berlangsung: [
        { status: 'selesai', label: 'Tandai Selesai', icon: Flag, className: 'text-blue-600 hover:text-blue-700' },
        { status: 'dibatalkan', label: 'Batalkan', icon: XCircle, className: 'text-red-600 hover:text-red-700' },
    ],
    selesai: [
        { status: 'berlangsung', label: 'Aktifkan Kembali', icon: RotateCcw, className: 'text-amber-600 hover:text-amber-700' },
    ],
    dibatalkan: [
        { status: 'draft', label: 'Kembalikan ke Draft', icon: RotateCcw, className: 'text-gray-600 hover:text-gray-700' },
    ],
};

export default function Show({ spk }) {
    const { auth } = usePage().props;
    const canManage = ['admin', 'supervisor'].includes(auth.user.role);
    const actions = STATUS_ACTIONS[spk.status] || [];
    const Info = ({ label, value }) => <div><dt className="text-sm text-gray-500">{label}</dt><dd className="text-sm font-medium text-gray-800 mt-0.5">{value || '-'}</dd></div>;

    const changeStatus = (status, label) => {
        if (confirm(`Ubah status SPK menjadi "${label}"?`)) {
            router.patch(`/spk/${spk.id}/status`, { status });
        }
    };

    return (
        <AppLayout title="Detail SPK">
            <Head title={spk.nomor_spk} />
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link href="/spk" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                {canManage && actions.map(({ status, label, icon: Icon, className }) => (
                    <button key={status} onClick={() => changeStatus(status, label)} className={`flex items-center gap-1 text-sm font-medium ${className}`}>
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
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
                    <div><dt className="text-sm text-gray-500">Status</dt><dd className="mt-0.5"><span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[spk.status] || 'bg-gray-100 text-gray-600'}`}>{spk.status}</span></dd></div>
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
