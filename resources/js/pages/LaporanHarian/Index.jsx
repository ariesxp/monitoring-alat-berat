import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye } from 'lucide-react';

export default function Index({ laporan, filters }) {
    return (
        <AppLayout title="Laporan Harian">
            <Head title="Laporan Harian" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/laporan-harian/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Buat Laporan</Link>
            </div>
            <SearchFilter route="/laporan-harian" filters={filters} placeholder="Cari nomor SPK..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">SPK</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Alat</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Operator</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Jam Kerja</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">BBM</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Kondisi</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Sumber</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                        </tr></thead>
                        <tbody>
                            {laporan.data.map((l) => (
                                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">{new Date(l.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 px-4 font-mono text-xs">{l.spk?.nomor_spk}</td>
                                    <td className="py-3 px-4">{l.alat_berat?.nama_alat}</td>
                                    <td className="py-3 px-4">{l.operator?.nama}</td>
                                    <td className="py-3 px-4">{l.jam_kerja} jam</td>
                                    <td className="py-3 px-4">{l.bbm_liter} ltr</td>
                                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${l.kondisi_alat === 'baik' ? 'bg-green-100 text-green-700' : l.kondisi_alat === 'rusak' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.kondisi_alat}</span></td>
                                    <td className="py-3 px-4"><span className={`text-xs ${l.sumber_input === 'whatsapp' ? 'text-green-600' : 'text-gray-500'}`}>{l.sumber_input}</span></td>
                                    <td className="py-3 px-4"><Link href={`/laporan-harian/${l.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link></td>
                                </tr>
                            ))}
                            {laporan.data.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400">Belum ada laporan harian</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={laporan.links} />
        </AppLayout>
    );
}
