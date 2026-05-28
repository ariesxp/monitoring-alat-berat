import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

export default function Index({ operators, filters }) {
    const formatRp = (v) => new Intl.NumberFormat('id-ID').format(v);

    return (
        <AppLayout title="Operator / Karyawan">
            <Head title="Operator" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/operator/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Operator
                </Link>
            </div>
            <SearchFilter route="/operator" filters={filters} placeholder="Cari nama, NIK, atau jabatan..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">NIK</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Jabatan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">No. HP</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operators.data.map((op) => (
                                <tr key={op.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{op.nama}</td>
                                    <td className="py-3 px-4 font-mono text-xs">{op.nik}</td>
                                    <td className="py-3 px-4">{op.jabatan}</td>
                                    <td className="py-3 px-4">{op.no_hp || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${op.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{op.status}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/operator/${op.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/operator/${op.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus operator ini?') && router.delete(`/operator/${op.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {operators.data.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada data operator</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={operators.links} />
        </AppLayout>
    );
}
