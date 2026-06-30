import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ permissions, filters }) {
    return (
        <AppLayout title="Permissions">
            <Head title="Permissions" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/permission/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Permission
                </Link>
            </div>
            <SearchFilter route="/permission" filters={filters} placeholder="Cari nama, slug, atau grup..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Slug</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Grup</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Deskripsi</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissions.data.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{p.name}</td>
                                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{p.slug}</td>
                                    <td className="py-3 px-4">
                                        {p.group ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{p.group}</span> : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{p.description || '-'}</td>
                                    <td className="py-3 px-4">{p.roles_count}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/permission/${p.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus permission ini?') && router.delete(`/permission/${p.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {permissions.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada data permission</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={permissions.links} />
        </AppLayout>
    );
}
