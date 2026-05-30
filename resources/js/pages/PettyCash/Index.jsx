import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

export default function Index({ pettyCash, filters, summary }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AppLayout title="Petty Cash">
            <Head title="Petty Cash" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-xs font-medium text-gray-500 uppercase">Total Debit</div>
                    <div className="text-xl font-bold text-green-600 mt-1">{formatRupiah(summary.total_debit)}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-xs font-medium text-gray-500 uppercase">Total Credit</div>
                    <div className="text-xl font-bold text-red-600 mt-1">{formatRupiah(summary.total_credit)}</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="text-xs font-medium text-gray-500 uppercase">Balance</div>
                    <div className={`text-xl font-bold mt-1 ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatRupiah(summary.balance)}</div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/petty-cash/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Voucher
                </Link>
            </div>

            <SearchFilter route="/petty-cash" filters={filters} placeholder="Cari voucher atau deskripsi...">
                <input
                    type="date"
                    value={filters.from_date || ''}
                    onChange={(e) => router.get('/petty-cash', { ...filters, from_date: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={filters.to_date || ''}
                    onChange={(e) => router.get('/petty-cash', { ...filters, to_date: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
            </SearchFilter>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Posting Date</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Voucher Number</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Items</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Total Debit</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Total Credit</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pettyCash.data.map((pc) => (
                                <tr key={pc.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500 text-xs">{formatDate(pc.posting_date)}</td>
                                    <td className="py-3 px-4 font-mono text-xs font-medium">{pc.voucher_number}</td>
                                    <td className="py-3 px-4">{pc.description}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{pc.details_count}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {parseFloat(pc.details_sum_debit) > 0 ? (
                                            <span className="text-green-600 font-medium">{formatRupiah(pc.details_sum_debit)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        {parseFloat(pc.details_sum_credit) > 0 ? (
                                            <span className="text-red-600 font-medium">{formatRupiah(pc.details_sum_credit)}</span>
                                        ) : '-'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/petty-cash/${pc.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/petty-cash/${pc.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus voucher ini beserta semua detailnya?') && router.delete(`/petty-cash/${pc.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pettyCash.data.length === 0 && (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada data petty cash</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={pettyCash.links} />
        </AppLayout>
    );
}
