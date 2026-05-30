import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const statusColor = {
    Draft: 'bg-gray-100 text-gray-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

export default function Index({ purchaseRequests, filters }) {
    const formatDate = (date) =>
        new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AppLayout title="Purchase Request">
            <Head title="Purchase Request" />

            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/purchase-request/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Buat PR
                </Link>
            </div>

            <SearchFilter route="/purchase-request" filters={filters} placeholder="Cari nomor PR, nama site, atau keterangan...">
                <select
                    value={filters.status || ''}
                    onChange={(e) => router.get('/purchase-request', { ...filters, status: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                >
                    <option value="">Semua Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>
                <input
                    type="date"
                    value={filters.from_date || ''}
                    onChange={(e) => router.get('/purchase-request', { ...filters, from_date: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={filters.to_date || ''}
                    onChange={(e) => router.get('/purchase-request', { ...filters, to_date: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
            </SearchFilter>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Tanggal</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nomor PR</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Domisili</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Jenis</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Site</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Request By</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseRequests.data.map((pr) => (
                                <tr key={pr.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(pr.posting_date)}</td>
                                    <td className="py-3 px-4 font-mono text-xs font-medium">{pr.nomor_pr}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${pr.domisili === 'HO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {pr.domisili}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-xs">{pr.jenis_pr}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-xs">{pr.kode_site}</div>
                                        <div className="text-gray-500 text-xs">{pr.nama_site}</div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{pr.details_count}</span>
                                    </td>
                                    <td className="py-3 px-4 text-xs">{pr.requester?.name}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[pr.status]}`}>
                                            {pr.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/purchase-request/${pr.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            {pr.status !== 'Approved' && (
                                                <>
                                                    <Link href={`/purchase-request/${pr.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                                    <button onClick={() => confirm('Hapus Purchase Request ini?') && router.delete(`/purchase-request/${pr.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {purchaseRequests.data.length === 0 && (
                                <tr><td colSpan={9} className="py-8 text-center text-gray-400">Belum ada data Purchase Request</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={purchaseRequests.links} />
        </AppLayout>
    );
}
