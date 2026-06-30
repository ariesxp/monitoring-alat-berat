import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2, Lock } from 'lucide-react';

export default function Index({ roles, filters }) {
    return (
        <AppLayout title="Roles">
            <Head title="Roles" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/role/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Role
                </Link>
            </div>
            <SearchFilter route="/role" filters={filters} placeholder="Cari nama atau slug role..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Slug</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Deskripsi</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Permissions</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.data.map((r) => (
                                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            {r.name}
                                            {r.is_locked && <Lock className="w-3.5 h-3.5 text-gray-400" title="Role inti" />}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{r.slug}</td>
                                    <td className="py-3 px-4 text-gray-600">{r.description || '-'}</td>
                                    <td className="py-3 px-4">{r.permissions_count}</td>
                                    <td className="py-3 px-4">{r.users_count}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/role/${r.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            {!r.is_locked && (
                                                <button onClick={() => confirm('Hapus role ini?') && router.delete(`/role/${r.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {roles.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada data role</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={roles.links} />
        </AppLayout>
    );
}
