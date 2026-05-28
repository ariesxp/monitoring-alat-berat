import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ clients, filters }) {
    return (
        <AppLayout title="Client">
            <Head title="Client" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/client/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Tambah Client</Link>
            </div>
            <SearchFilter route="/client" filters={filters} placeholder="Cari perusahaan atau PIC..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Perusahaan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">PIC</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">No. HP</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.data.map((c) => (
                                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{c.nama_perusahaan}</td>
                                    <td className="py-3 px-4">{c.nama_pic}</td>
                                    <td className="py-3 px-4">{c.no_hp_pic || '-'}</td>
                                    <td className="py-3 px-4">{c.email || '-'}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/client/${c.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus client ini?') && router.delete(`/client/${c.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clients.data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada data client</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={clients.links} />
        </AppLayout>
    );
}
