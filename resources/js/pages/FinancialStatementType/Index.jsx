import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ types, filters }) {
    return (
        <AppLayout title="Financial Statement Type">
            <Head title="Financial Statement Type" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/financial-statement-type/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Type
                </Link>
            </div>
            <SearchFilter route="/financial-statement-type" filters={filters} placeholder="Cari kode atau nama type..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Jumlah Account</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {types.data.map((t) => (
                                <tr key={t.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{t.code}</td>
                                    <td className="py-3 px-4 font-medium">{t.name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{t.accounts_count}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/financial-statement-type/${t.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus type ini?') && router.delete(`/financial-statement-type/${t.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {types.data.length === 0 && (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada data financial statement type</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={types.links} />
        </AppLayout>
    );
}
