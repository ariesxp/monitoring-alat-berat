import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye } from 'lucide-react';

export default function Index({ pengeluaran, filters }) {
    return (
        <AppLayout title="Pengeluaran Gudang">
            <Head title="Pengeluaran Gudang" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/pengeluaran-gudang/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Tambah Pengeluaran</Link>
            </div>
            <SearchFilter route="/pengeluaran-gudang" filters={filters} placeholder="Cari nomor atau tujuan..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">No. Pengeluaran</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tujuan</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">SPK</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                        </tr></thead>
                        <tbody>
                            {pengeluaran.data.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{p.nomor_pengeluaran}</td>
                                    <td className="py-3 px-4">{new Date(p.tanggal_keluar).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 px-4">{p.tujuan}</td>
                                    <td className="py-3 px-4 text-xs">{p.spk?.nomor_spk || '-'}</td>
                                    <td className="py-3 px-4"><Link href={`/pengeluaran-gudang/${p.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link></td>
                                </tr>
                            ))}
                            {pengeluaran.data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada pengeluaran</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={pengeluaran.links} />
        </AppLayout>
    );
}
