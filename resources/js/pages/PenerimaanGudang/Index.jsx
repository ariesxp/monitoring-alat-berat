import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye } from 'lucide-react';

export default function Index({ penerimaan, filters }) {
    const formatRp = (v) => new Intl.NumberFormat('id-ID').format(v);

    return (
        <AppLayout title="Penerimaan Gudang">
            <Head title="Penerimaan Gudang" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/penerimaan-gudang/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Plus className="w-4 h-4" /> Tambah Penerimaan</Link>
            </div>
            <SearchFilter route="/penerimaan-gudang" filters={filters} placeholder="Cari nomor penerimaan atau supplier..." />
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">No. Penerimaan</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Supplier</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Sumber</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Dibuat Oleh</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                        </tr></thead>
                        <tbody>
                            {penerimaan.data.map((p) => (
                                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{p.nomor_penerimaan}</td>
                                    <td className="py-3 px-4">{new Date(p.tanggal_terima).toLocaleDateString('id-ID')}</td>
                                    <td className="py-3 px-4">{p.supplier}</td>
                                    <td className="py-3 px-4"><span className={`text-xs ${p.sumber_input === 'whatsapp' ? 'text-green-600' : 'text-gray-500'}`}>{p.sumber_input}</span></td>
                                    <td className="py-3 px-4">{p.created_by?.name}</td>
                                    <td className="py-3 px-4"><Link href={`/penerimaan-gudang/${p.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link></td>
                                </tr>
                            ))}
                            {penerimaan.data.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada penerimaan</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={penerimaan.links} />
        </AppLayout>
    );
}
