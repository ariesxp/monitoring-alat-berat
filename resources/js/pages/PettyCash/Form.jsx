import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';

const emptyDetail = { account_id: '', description: '', remark: '', debit: '0', credit: '0' };

export default function Form({ pettyCash, accounts }) {
    const isEdit = !!pettyCash;

    const initialDetails = isEdit && pettyCash.details?.length
        ? pettyCash.details.map(d => ({
            account_id: d.account_id || '',
            description: d.description || '',
            remark: d.remark || '',
            debit: d.debit || '0',
            credit: d.credit || '0',
        }))
        : [{ ...emptyDetail }];

    const { data, setData, post, put, processing, errors } = useForm({
        posting_date: pettyCash?.posting_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        voucher_number: pettyCash?.voucher_number || '',
        description: pettyCash?.description || '',
        remark: pettyCash?.remark || '',
        details: initialDetails,
    });

    const addDetail = () => {
        setData('details', [...data.details, { ...emptyDetail }]);
    };

    const removeDetail = (index) => {
        if (data.details.length <= 1) return;
        setData('details', data.details.filter((_, i) => i !== index));
    };

    const updateDetail = (index, field, value) => {
        const updated = data.details.map((d, i) => i === index ? { ...d, [field]: value } : d);
        setData('details', updated);
    };

    const totalDebit = data.details.reduce((sum, d) => sum + (parseFloat(d.debit) || 0), 0);
    const totalCredit = data.details.reduce((sum, d) => sum + (parseFloat(d.credit) || 0), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;

    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const submit = (e) => {
        e.preventDefault();
        if (!isBalanced) return;
        isEdit ? put(`/petty-cash/${pettyCash.id}`) : post('/petty-cash');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Petty Cash' : 'Tambah Petty Cash'}>
            <Head title={isEdit ? 'Edit Petty Cash' : 'Tambah Petty Cash'} />
            <form onSubmit={submit} className="space-y-4">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Header Voucher</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Posting Date <span className="text-red-500">*</span></label>
                            <input type="date" value={data.posting_date} onChange={(e) => setData('posting_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {errors.posting_date && <p className="text-red-500 text-xs mt-1">{errors.posting_date}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Number <span className="text-red-500">*</span></label>
                            <input type="text" value={data.voucher_number} onChange={(e) => setData('voucher_number', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="PC-202605-0001" />
                            {errors.voucher_number && <p className="text-red-500 text-xs mt-1">{errors.voucher_number}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                        <input type="text" value={data.description} onChange={(e) => setData('description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Deskripsi voucher" />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                        <textarea value={data.remark} onChange={(e) => setData('remark', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Catatan tambahan (opsional)" />
                        {errors.remark && <p className="text-red-500 text-xs mt-1">{errors.remark}</p>}
                    </div>
                </div>

                {/* Detail Lines */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Detail Transaksi</h2>
                        <button type="button" onClick={addDetail} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                            <Plus className="w-3.5 h-3.5" /> Tambah Baris
                        </button>
                    </div>
                    {errors.details && <p className="text-red-500 text-xs">{errors.details}</p>}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-8">#</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[200px]">Account <span className="text-red-500">*</span></th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[180px]">Description <span className="text-red-500">*</span></th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[120px]">Remark</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-36">Debit</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-36">Credit</th>
                                    <th className="py-2 px-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.details.map((detail, idx) => (
                                    <tr key={idx} className="border-t border-gray-100">
                                        <td className="py-2 px-3 text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="py-2 px-3">
                                            <select value={detail.account_id} onChange={(e) => updateDetail(idx, 'account_id', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                                                <option value="">Pilih Account</option>
                                                {accounts.map((a) => (
                                                    <option key={a.id} value={a.id}>{a.account_number} - {a.account_description || '-'}</option>
                                                ))}
                                            </select>
                                            {errors[`details.${idx}.account_id`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.account_id`]}</p>}
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="text" value={detail.description} onChange={(e) => updateDetail(idx, 'description', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" placeholder="Keterangan" />
                                            {errors[`details.${idx}.description`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.description`]}</p>}
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="text" value={detail.remark} onChange={(e) => updateDetail(idx, 'remark', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500" placeholder="-" />
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="number" value={detail.debit} onChange={(e) => updateDetail(idx, 'debit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500" min="0" step="1" />
                                            {errors[`details.${idx}.debit`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.debit`]}</p>}
                                        </td>
                                        <td className="py-2 px-3">
                                            <input type="number" value={detail.credit} onChange={(e) => updateDetail(idx, 'credit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500" min="0" step="1" />
                                            {errors[`details.${idx}.credit`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.credit`]}</p>}
                                        </td>
                                        <td className="py-2 px-3">
                                            {data.details.length > 1 && (
                                                <button type="button" onClick={() => removeDetail(idx)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-medium">
                                <tr className="border-t-2 border-gray-300">
                                    <td colSpan={4} className="py-3 px-3 text-right text-gray-600">Total</td>
                                    <td className="py-3 px-3 text-right text-green-600">{formatRupiah(totalDebit)}</td>
                                    <td className="py-3 px-3 text-right text-red-600">{formatRupiah(totalCredit)}</td>
                                    <td></td>
                                </tr>
                                <tr className="border-t border-gray-200">
                                    <td colSpan={4} className="py-3 px-3 text-right text-gray-600">Selisih</td>
                                    <td colSpan={2} className={`py-3 px-3 text-right font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                                        {isBalanced ? 'BALANCE' : formatRupiah(Math.abs(difference))}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Balance Warning */}
                {!isBalanced && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        Total Debit dan Credit belum balance. Selisih: <span className="font-semibold">{formatRupiah(Math.abs(difference))}</span>. Pastikan total Debit sama dengan total Credit sebelum menyimpan.
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button type="submit" disabled={processing || !isBalanced} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                    <Link href="/petty-cash" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
