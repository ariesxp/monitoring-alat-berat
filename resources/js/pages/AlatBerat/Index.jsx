import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const statusColors = {
    tersedia: 'bg-green-100 text-green-700',
    beroperasi: 'bg-blue-100 text-blue-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    rusak: 'bg-red-100 text-red-700',
};

export default function Index({ alatBerat, filters }) {
    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus alat berat ini?')) {
            router.delete(`/alat-berat/${id}`);
        }
    };

    return (
        <AppLayout title="Alat Berat">
            <Head title="Alat Berat" />

            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/alat-berat/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Alat
                </Link>
            </div>

            <SearchFilter route="/alat-berat" filters={filters} placeholder="Cari kode, nama, atau jenis...">
                <select
                    value={filters.status || ''}
                    onChange={(e) => router.get('/alat-berat', { ...filters, status: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                    <option value="">Semua Status</option>
                    <option value="tersedia">Tersedia</option>
                    <option value="beroperasi">Beroperasi</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="rusak">Rusak</option>
                </select>
            </SearchFilter>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Alat</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Merk</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Tahun</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alatBerat.data.map((alat) => (
                                <tr key={alat.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{alat.kode_alat}</td>
                                    <td className="py-3 px-4 font-medium">{alat.nama_alat}</td>
                                    <td className="py-3 px-4">{alat.jenis}</td>
                                    <td className="py-3 px-4">{alat.merk}</td>
                                    <td className="py-3 px-4">{alat.tahun || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[alat.status]}`}>
                                            {alat.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/alat-berat/${alat.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/alat-berat/${alat.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => handleDelete(alat.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {alatBerat.data.length === 0 && (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada data alat berat</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={alatBerat.links} />
        </AppLayout>
    );
}
