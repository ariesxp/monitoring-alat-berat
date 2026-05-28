import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function Show({ alatBerat }) {
    const Info = ({ label, value }) => (
        <div>
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="text-sm font-medium text-gray-800 mt-0.5">{value || '-'}</dd>
        </div>
    );

    return (
        <AppLayout title="Detail Alat Berat">
            <Head title={alatBerat.nama_alat} />

            <div className="flex gap-3 mb-4">
                <Link href="/alat-berat" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="w-4 h-4" /> Kembali</Link>
                <Link href={`/alat-berat/${alatBerat.id}/edit`} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"><Pencil className="w-4 h-4" /> Edit</Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{alatBerat.nama_alat}</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Info label="Kode Alat" value={alatBerat.kode_alat} />
                    <Info label="Jenis" value={alatBerat.jenis} />
                    <Info label="Merk" value={alatBerat.merk} />
                    <Info label="Tahun" value={alatBerat.tahun} />
                    <Info label="Nomor Seri" value={alatBerat.nomor_seri} />
                    <Info label="Nomor Polisi" value={alatBerat.nomor_polisi} />
                    <Info label="No. Mesin" value={alatBerat.no_mesin} />
                    <Info label="No. Chassis" value={alatBerat.no_chassis} />
                    <Info label="Dealer" value={alatBerat.dealer} />
                    <Info label="Harga" value={alatBerat.harga ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(alatBerat.harga) : null} />
                    <Info label="Invoice" value={alatBerat.invoice} />
                    <Info label="HM Awal" value={alatBerat.hm_awal ? `${alatBerat.hm_awal} jam` : null} />
                    <Info label="Status" value={alatBerat.status} />
                    <Info label="Lokasi Terakhir" value={alatBerat.lokasi_terakhir} />
                </dl>
                {alatBerat.catatan && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Catatan</p>
                        <p className="text-sm text-gray-700">{alatBerat.catatan}</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
