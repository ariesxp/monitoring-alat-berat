import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ golongans, filters }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AppLayout title="Golongan">
            <Head title="Golongan" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/golongan/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Golongan
                </Link>
            </div>
            <SearchFilter route="/golongan" filters={filters} placeholder="Cari kode atau nama golongan..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Golongan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Gaji Golongan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {golongans.data.map((g) => (
                                <tr key={g.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{g.kode_golongan}</td>
                                    <td className="py-3 px-4 font-medium">{g.nama_golongan}</td>
                                    <td className="py-3 px-4">{formatRupiah(g.gaji_golongan)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/golongan/${g.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus golongan ini?') && router.delete(`/golongan/${g.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {golongans.data.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data golongan</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={golongans.links} />
        </AppLayout>
    );
}
