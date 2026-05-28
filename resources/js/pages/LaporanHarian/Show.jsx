import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show({ laporan }) {
    const Info = ({ label, value }) => <div><dt className="text-sm text-gray-500">{label}</dt><dd className="text-sm font-medium text-gray-800 mt-0.5">{value || '-'}</dd></div>;

    return (
        <AppLayout title="Detail Laporan Harian">
            <Head title="Detail Laporan" />
            <Link href="/laporan-harian" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Info label="SPK" value={laporan.spk?.nomor_spk} />
                    <Info label="Alat Berat" value={laporan.alat_berat?.nama_alat} />
                    <Info label="Operator" value={laporan.operator?.nama} />
                    <Info label="Tanggal" value={new Date(laporan.tanggal).toLocaleDateString('id-ID')} />
                    <Info label="Jam Kerja" value={`${laporan.jam_mulai?.substring(0, 5)} - ${laporan.jam_selesai?.substring(0, 5)} (${laporan.jam_kerja} jam)`} />
                    <Info label="BBM" value={`${laporan.bbm_liter} liter`} />
                    <Info label="Hour Meter" value={`${laporan.hm_awal} - ${laporan.hm_akhir}`} />
                    <Info label="Jenis Pekerjaan" value={laporan.jenis_pekerjaan} />
                    <Info label="Kondisi Alat" value={laporan.kondisi_alat} />
                    <Info label="Sumber Input" value={laporan.sumber_input} />
                </dl>
                {laporan.catatan && <div className="mt-4 pt-4 border-t border-gray-100"><p className="text-sm text-gray-500 mb-1">Catatan</p><p className="text-sm">{laporan.catatan}</p></div>}
            </div>
        </AppLayout>
    );
}
