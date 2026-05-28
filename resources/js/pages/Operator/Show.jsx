import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Show({ operator }) {
    const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const Info = ({ label, value }) => (
        <div><dt className="text-sm text-gray-500">{label}</dt><dd className="text-sm font-medium text-gray-800 mt-0.5">{value || '-'}</dd></div>
    );

    return (
        <AppLayout title="Detail Operator">
            <Head title={operator.nama} />
            <Link href="/operator" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4">{operator.nama}</h2>
                <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Data Pribadi</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <Info label="No. KTP" value={operator.nik} />
                    <Info label="Jenis Kelamin" value={operator.jenis_kelamin} />
                    <Info label="Tempat Lahir" value={operator.tempat_lahir} />
                    <Info label="Tanggal Lahir" value={operator.tanggal_lahir ? new Date(operator.tanggal_lahir).toLocaleDateString('id-ID') : '-'} />
                    <Info label="No. HP" value={operator.no_hp} />
                    <Info label="Status Perkawinan" value={operator.status_perkawinan} />
                    <Info label="Pendidikan" value={operator.pendidikan} />
                    <Info label="Alamat" value={operator.alamat} />
                </dl>

                <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Data Kepegawaian</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Info label="Kode Karyawan" value={operator.kode_karyawan} />
                    <Info label="Jabatan" value={operator.jabatan} />
                    <Info label="Golongan" value={operator.golongan ? `${operator.golongan.kode_golongan} - ${operator.golongan.nama_golongan}` : '-'} />
                    <Info label="Departemen" value={operator.departemen} />
                    <Info label="Tanggal Masuk" value={operator.tanggal_masuk ? new Date(operator.tanggal_masuk).toLocaleDateString('id-ID') : '-'} />
                    <Info label="Gaji Pokok" value={formatRp(operator.gaji_pokok)} />
                    <Info label="Tunjangan" value={formatRp(operator.tunjangan)} />
                    <Info label="Status" value={operator.status} />
                </dl>
            </div>
        </AppLayout>
    );
}
