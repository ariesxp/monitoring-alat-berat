import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function Index({ accounts, filters, financialStatementTypes }) {
    return (
        <AppLayout title="Chart of Account">
            <Head title="Chart of Account" />
            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/account/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Account
                </Link>
            </div>
            <SearchFilter route="/account" filters={filters} placeholder="Cari nomor akun, deskripsi, atau main account...">
                <select
                    value={filters.financial_statement_type_id || ''}
                    onChange={(e) => router.get('/account', { ...filters, financial_statement_type_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                >
                    <option value="">Semua Tipe</option>
                    {financialStatementTypes.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </SearchFilter>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Account Number</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Description</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Main Account</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Financial Statement</th>
                                <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.data.map((a) => (
                                <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-xs">{a.account_number}</td>
                                    <td className="py-3 px-4">{a.account_description || '-'}</td>
                                    <td className="py-3 px-4 font-medium">{a.main_account?.name || '-'}</td>
                                    <td className="py-3 px-4">{a.account_type || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {a.financial_statement_type?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        {a.is_active
                                            ? <CheckCircle className="w-4 h-4 text-green-500 inline" />
                                            : <XCircle className="w-4 h-4 text-red-400 inline" />
                                        }
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/account/${a.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus account ini?') && router.delete(`/account/${a.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {accounts.data.length === 0 && (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada data account</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={accounts.links} />
        </AppLayout>
    );
}
