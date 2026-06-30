import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function Index({ users, filters }) {
    return (
        <AppLayout title="Users">
            <Head title="Users" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/user/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah User
                </Link>
            </div>
            <SearchFilter route="/user" filters={filters} placeholder="Cari nama, email, atau role..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">No. HP</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((u) => (
                                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{u.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{u.email}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">{u.role}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{u.phone || '-'}</td>
                                    <td className="py-3 px-4">
                                        {u.is_active
                                            ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Aktif</span>
                                            : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Nonaktif</span>}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/user/${u.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus user ini?') && router.delete(`/user/${u.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada data user</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={users.links} />
        </AppLayout>
    );
}
