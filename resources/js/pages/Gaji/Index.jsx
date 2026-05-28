import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import { Plus, Eye, Trash2 } from 'lucide-react';

const statusColors = { draft: 'bg-gray-100 text-gray-600', diproses: 'bg-blue-100 text-blue-700', selesai: 'bg-green-100 text-green-700' };

export default function Index({ penggajian }) {
    return (
        <AppLayout title="Gaji Karyawan">
            <Head title="Gaji Karyawan" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/gaji/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Buat Periode</Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Periode</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Jumlah Karyawan</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                        </tr></thead>
                        <tbody>
                            {penggajian.data.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium">{p.periode}</td>
                                    <td className="py-3 px-4 text-xs">{new Date(p.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(p.tanggal_selesai).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 px-4">{p.details_count} orang</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span></td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/gaji/${p.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus periode ini?') && router.delete(`/gaji/${p.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {penggajian.data.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400">Belum ada data penggajian</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={penggajian.links} />
        </AppLayout>
    );
}
