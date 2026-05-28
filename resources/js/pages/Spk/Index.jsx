import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const statusColors = { draft: 'bg-gray-100 text-gray-600', disetujui: 'bg-green-100 text-green-700', berlangsung: 'bg-blue-100 text-blue-700', selesai: 'bg-purple-100 text-purple-700', dibatalkan: 'bg-red-100 text-red-700' };

export default function Index({ spkList, filters }) {
    return (
        <AppLayout title="Surat Perintah Kerja">
            <Head title="SPK" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/spk/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Buat SPK</Link>
            </div>
            <SearchFilter route="/spk" filters={filters} placeholder="Cari nomor SPK atau pekerjaan..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">No. SPK</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kontrak</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Alat</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Operator</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Pekerjaan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {spkList.data.map((s) => (
                                <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{s.nomor_spk}</td>
                                    <td className="py-3 px-4 text-xs">{s.kontrak_kerja?.nomor_kontrak}</td>
                                    <td className="py-3 px-4">{s.alat_berat?.nama_alat}</td>
                                    <td className="py-3 px-4">{s.operator?.nama}</td>
                                    <td className="py-3 px-4">{s.jenis_pekerjaan}</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[s.status]}`}>{s.status}</span></td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/spk/${s.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/spk/${s.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus SPK ini?') && router.delete(`/spk/${s.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {spkList.data.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada SPK</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={spkList.links} />
        </AppLayout>
    );
}
