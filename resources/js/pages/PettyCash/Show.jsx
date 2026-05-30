import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function Show({ pettyCash }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const details = pettyCash.details || [];
    const totalDebit = details.reduce((s, d) => s + parseFloat(d.debit || 0), 0);
    const totalCredit = details.reduce((s, d) => s + parseFloat(d.credit || 0), 0);

    return (
        <AppLayout title="Detail Petty Cash">
            <Head title="Detail Petty Cash" />
            <div className="space-y-4">
                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/petty-cash" className="p-2 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1" />
                    <Link href={`/petty-cash/${pettyCash.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <button
                        onClick={() => confirm('Hapus voucher ini beserta semua detailnya?') && router.delete(`/petty-cash/${pettyCash.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                </div>

                {/* Header Info */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Header Voucher</h2>
                    </div>
                    <table className="w-full text-sm">
                        <tbody>
                            <tr className="border-t border-gray-100 first:border-t-0">
                                <td className="py-3 px-4 font-medium text-gray-500 w-48">Voucher Number</td>
                                <td className="py-3 px-4 font-mono font-semibold">{pettyCash.voucher_number}</td>
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-500">Posting Date</td>
                                <td className="py-3 px-4">{formatDate(pettyCash.posting_date)}</td>
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-500">Description</td>
                                <td className="py-3 px-4">{pettyCash.description}</td>
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-500">Remark</td>
                                <td className="py-3 px-4">{pettyCash.remark || '-'}</td>
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-500">Dibuat oleh</td>
                                <td className="py-3 px-4">{pettyCash.creator?.name}</td>
                            </tr>
                            <tr className="border-t border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-500">Tanggal dibuat</td>
                                <td className="py-3 px-4">{formatDate(pettyCash.created_at)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Detail Lines */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Detail Transaksi ({details.length} item)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600 w-8">#</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Account</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Description</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Remark</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-600">Debit</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-600">Credit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((d, idx) => (
                                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="py-2 px-4">
                                            <div className="font-mono text-xs text-gray-500">{d.account?.account_number}</div>
                                            <div className="text-xs text-gray-600">{d.account?.account_description || '-'}</div>
                                        </td>
                                        <td className="py-2 px-4">{d.description}</td>
                                        <td className="py-2 px-4 text-gray-500">{d.remark || '-'}</td>
                                        <td className="py-2 px-4 text-right">
                                            {parseFloat(d.debit) > 0
                                                ? <span className="text-green-600 font-medium">{formatRupiah(d.debit)}</span>
                                                : '-'}
                                        </td>
                                        <td className="py-2 px-4 text-right">
                                            {parseFloat(d.credit) > 0
                                                ? <span className="text-red-600 font-medium">{formatRupiah(d.credit)}</span>
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-medium">
                                <tr className="border-t-2 border-gray-300">
                                    <td colSpan={4} className="py-3 px-4 text-right text-gray-600">Total</td>
                                    <td className="py-3 px-4 text-right text-green-600 font-semibold">{formatRupiah(totalDebit)}</td>
                                    <td className="py-3 px-4 text-right text-red-600 font-semibold">{formatRupiah(totalCredit)}</td>
                                </tr>
                                <tr className="border-t border-gray-200">
                                    <td colSpan={4} className="py-3 px-4 text-right text-gray-600">Balance (Debit - Credit)</td>
                                    <td colSpan={2} className={`py-3 px-4 text-right font-bold text-lg ${totalDebit - totalCredit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {formatRupiah(totalDebit - totalCredit)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
