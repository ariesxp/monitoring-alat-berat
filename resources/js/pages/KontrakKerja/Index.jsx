import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const statusColors = { draft: 'bg-gray-100 text-gray-600', aktif: 'bg-green-100 text-green-700', selesai: 'bg-blue-100 text-blue-700', dibatalkan: 'bg-red-100 text-red-700' };
const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Index({ kontrak, filters }) {
    return (
        <AppLayout title="Kontrak Kerja">
            <Head title="Kontrak Kerja" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/kontrak-kerja/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Buat Kontrak</Link>
            </div>
            <SearchFilter route="/kontrak-kerja" filters={filters} placeholder="Cari nomor kontrak atau proyek...">
                <select value={filters.status || ''} onChange={(e) => router.get('/kontrak-kerja', { ...filters, status: e.target.value || undefined }, { preserveState: true, replace: true })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                    <option value="dibatalkan">Dibatalkan</option>
                </select>
            </SearchFilter>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">No. Kontrak</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Proyek</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nilai</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Periode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kontrak.data.map((k) => (
                                <tr key={k.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{k.nomor_kontrak}</td>
                                    <td className="py-3 px-4 font-medium">{k.nama_proyek}</td>
                                    <td className="py-3 px-4">{k.client?.nama_perusahaan}</td>
                                    <td className="py-3 px-4">{formatRp(k.nilai_kontrak)}</td>
                                    <td className="py-3 px-4 text-xs">{new Date(k.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(k.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[k.status]}`}>{k.status}</span></td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/kontrak-kerja/${k.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/kontrak-kerja/${k.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus kontrak ini?') && router.delete(`/kontrak-kerja/${k.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {kontrak.data.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada kontrak kerja</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={kontrak.links} />
        </AppLayout>
    );
}
