import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

const accountTypes = ['Sale', 'Cost', 'Activa', 'Pasiva', 'Expense'];

export default function Form({ account, parentAccounts = [], mainAccounts, financialStatementTypes }) {
    const isEdit = !!account;
    const { data, setData, post, put, processing, errors } = useForm({
        account_number: account?.account_number || '',
        account_description: account?.account_description || '',
        parent_id: account?.parent_id || '',
        level: account?.level || 1,
        main_account_id: account?.main_account_id || '',
        account_type: account?.account_type || '',
        financial_statement_type_id: account?.financial_statement_type_id || '',
        is_active: account?.is_active ?? true,
    });

    // Level otomatis mengikuti parent: tanpa parent = 1, selebihnya = level parent + 1.
    const onParentChange = (value) => {
        if (!value) {
            setData((d) => ({ ...d, parent_id: '', level: 1 }));
            return;
        }
        const parent = parentAccounts.find((p) => String(p.id) === String(value));
        setData((d) => ({ ...d, parent_id: value, level: parent ? (parent.level || 1) + 1 : 1 }));
    };

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/account/${account.id}`) : post('/account');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Account' : 'Tambah Account'}>
            <Head title={isEdit ? 'Edit Account' : 'Tambah Account'} />
            <div className="max-w-2xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Akun <span className="text-red-500">*</span></label>
                            <input type="text" value={data.account_number} onChange={(e) => setData('account_number', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="1101" />
                            {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Akun</label>
                            <input type="text" value={data.account_description} onChange={(e) => setData('account_description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Kas Kecil Site" />
                            {errors.account_description && <p className="text-red-500 text-xs mt-1">{errors.account_description}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Account</label>
                            <select value={data.parent_id} onChange={(e) => onParentChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">— Tanpa parent (Header / Level 1) —</option>
                                {parentAccounts.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {' '.repeat((p.level - 1) * 3)}{p.account_number} - {p.account_description} (L{p.level})
                                    </option>
                                ))}
                            </select>
                            {errors.parent_id && <p className="text-red-500 text-xs mt-1">{errors.parent_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Level (Jenjang)</label>
                            <input type="number" value={data.level} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-600" />
                            {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                            <select value={data.account_type} onChange={(e) => setData('account_type', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Account Type</option>
                                {accountTypes.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            {errors.account_type && <p className="text-red-500 text-xs mt-1">{errors.account_type}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Statement Type</label>
                            <select value={data.financial_statement_type_id} onChange={(e) => setData('financial_statement_type_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Financial Statement Type</option>
                                {financialStatementTypes.map((t) => (
                                    <option key={t.id} value={t.id}>{t.code} - {t.name}</option>
                                ))}
                            </select>
                            {errors.financial_statement_type_id && <p className="text-red-500 text-xs mt-1">{errors.financial_statement_type_id}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Main Account</label>
                        <select value={data.main_account_id} onChange={(e) => setData('main_account_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                            <option value="">Pilih Main Account (opsional)</option>
                            {mainAccounts.map((m) => (
                                <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                            ))}
                        </select>
                        {errors.main_account_id && <p className="text-red-500 text-xs mt-1">{errors.main_account_id}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        <input type="checkbox" id="is_active" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="is_active" className="text-sm text-gray-700">Account Aktif</label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{processing ? 'Menyimpan...' : 'Simpan'}</button>
                        <Link href="/account" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
