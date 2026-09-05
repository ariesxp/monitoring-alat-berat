import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ jabatans, filters }) {
    return (
        <AppLayout title="Jabatan">
            <Head title="Jabatan" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/jabatan/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Jabatan
                </Link>
            </div>
            <SearchFilter route="/jabatan" filters={filters} placeholder="Cari kode atau nama jabatan..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Jabatan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Keterangan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jabatans.data.map((j) => (
                                <tr key={j.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{j.kode_jabatan}</td>
                                    <td className="py-3 px-4 font-medium">{j.nama_jabatan}</td>
                                    <td className="py-3 px-4 text-gray-600">{j.keterangan || <span className="text-gray-300">-</span>}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/jabatan/${j.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus jabatan ini?') && router.delete(`/jabatan/${j.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {jabatans.data.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data jabatan</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={jabatans.links} />
        </AppLayout>
    );
}
