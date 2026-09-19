import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Settings, Building2, MapPin, Clock, Plus, Pencil, Trash2, X, Save, CheckCircle2, XCircle, Wallet } from 'lucide-react';

export default function Index({ settings, offices, settingsRaw }) {
    return (
        <AppLayout title="Pengaturan">
            <Head title="Pengaturan" />
            <div className="space-y-6">
                <GeneralSettings settings={settings} />
                <OfficesSection offices={offices} />
                <RawSettings rows={settingsRaw} />
            </div>
        </AppLayout>
    );
}

/* ------------------------------------------------------------------ */
/* Pengaturan Umum (tabel settings)                                    */
/* ------------------------------------------------------------------ */
function GeneralSettings({ settings }) {
    const form = useForm({
        office_name: settings.office_name ?? '',
        office_lat: settings.office_lat ?? '',
        office_lng: settings.office_lng ?? '',
        office_radius_m: settings.office_radius_m ?? '',
        jam_masuk: settings.jam_masuk ?? '',
        batas_terlambat: settings.batas_terlambat ?? '',
        jam_pulang: settings.jam_pulang ?? '',
        rp_per_ritase: settings.rp_per_ritase ?? '',
        rp_per_hm: settings.rp_per_hm ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.put('/pengaturan', { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-800">Pengaturan Umum</h2>
                <span className="text-xs text-gray-400">(disimpan di tabel settings)</span>
            </div>
            <form onSubmit={submit} className="space-y-4">
                <Field label="Nama Kantor Utama" error={form.errors.office_name}>
                    <input type="text" value={form.data.office_name} onChange={(e) => form.setData('office_name', e.target.value)} className={inputCls} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Latitude" error={form.errors.office_lat}>
                        <input type="number" step="any" value={form.data.office_lat} onChange={(e) => form.setData('office_lat', e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Longitude" error={form.errors.office_lng}>
                        <input type="number" step="any" value={form.data.office_lng} onChange={(e) => form.setData('office_lng', e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Radius Absensi (m)" error={form.errors.office_radius_m}>
                        <input type="number" value={form.data.office_radius_m} onChange={(e) => form.setData('office_radius_m', e.target.value)} className={inputCls} />
                    </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Jam Masuk" error={form.errors.jam_masuk}>
                        <input type="time" value={form.data.jam_masuk} onChange={(e) => form.setData('jam_masuk', e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Batas Terlambat" error={form.errors.batas_terlambat}>
                        <input type="time" value={form.data.batas_terlambat} onChange={(e) => form.setData('batas_terlambat', e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Jam Pulang" error={form.errors.jam_pulang}>
                        <input type="time" value={form.data.jam_pulang} onChange={(e) => form.setData('jam_pulang', e.target.value)} className={inputCls} />
                    </Field>
                </div>
                <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                        <Wallet className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-gray-700">Tarif Hasil Kerja</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Rp / Ritase" error={form.errors.rp_per_ritase}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                                <input type="number" min="0" step="any" value={form.data.rp_per_ritase} onChange={(e) => form.setData('rp_per_ritase', e.target.value)} className={`${inputCls} pl-9`} />
                            </div>
                        </Field>
                        <Field label="Rp / HM" error={form.errors.rp_per_hm}>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
                                <input type="number" min="0" step="any" value={form.data.rp_per_hm} onChange={(e) => form.setData('rp_per_hm', e.target.value)} className={`${inputCls} pl-9`} />
                            </div>
                        </Field>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                        <Save className="w-4 h-4" /> {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Kantor Cabang (tabel offices)                                       */
/* ------------------------------------------------------------------ */
function OfficesSection({ offices }) {
    const [modal, setModal] = useState(null); // null | {} (baru) | office (edit)

    const remove = (o) => {
        if (!window.confirm(`Hapus kantor "${o.nama}"?`)) return;
        router.delete(`/pengaturan/office/${o.id}`, { preserveScroll: true });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base font-semibold text-gray-800">Kantor Cabang</h2>
                    <span className="text-xs text-gray-400">(tabel offices — validasi radius absensi)</span>
                </div>
                <button onClick={() => setModal({})} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Kantor
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Nama</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Koordinat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Radius</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Jam Kerja</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Aksi</th>
                    </tr></thead>
                    <tbody>
                        {offices.map((o) => (
                            <tr key={o.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-800">{o.nama}</td>
                                <td className="py-3 px-4 text-gray-600"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" />{Number(o.lat).toFixed(5)}, {Number(o.lng).toFixed(5)}</span></td>
                                <td className="py-3 px-4">{o.radius_m} m</td>
                                <td className="py-3 px-4 text-gray-600"><span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{o.jam_masuk || '-'} s/d {o.jam_pulang || '-'}</span></td>
                                <td className="py-3 px-4">
                                    {o.aktif
                                        ? <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700"><CheckCircle2 className="w-3.5 h-3.5" /> Aktif</span>
                                        : <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500"><XCircle className="w-3.5 h-3.5" /> Nonaktif</span>}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => setModal(o)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Edit"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => remove(o)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {offices.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada kantor cabang</td></tr>}
                    </tbody>
                </table>
            </div>

            {modal && <OfficeModal office={modal} onClose={() => setModal(null)} />}
        </div>
    );
}

function OfficeModal({ office, onClose }) {
    const isEdit = !!office?.id;
    const form = useForm({
        nama: office.nama ?? '',
        lat: office.lat ?? '',
        lng: office.lng ?? '',
        radius_m: office.radius_m ?? 20,
        jam_masuk: office.jam_masuk ?? '',
        batas_terlambat: office.batas_terlambat ?? '',
        jam_pulang: office.jam_pulang ?? '',
        aktif: office.aktif ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        const opts = { preserveScroll: true, onSuccess: onClose };
        if (isEdit) form.put(`/pengaturan/office/${office.id}`, opts);
        else form.post('/pengaturan/office', opts);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-800">{isEdit ? 'Edit Kantor' : 'Tambah Kantor'}</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nama Kantor" error={form.errors.nama}>
                        <input type="text" value={form.data.nama} onChange={(e) => form.setData('nama', e.target.value)} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Latitude" error={form.errors.lat}>
                            <input type="number" step="any" value={form.data.lat} onChange={(e) => form.setData('lat', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Longitude" error={form.errors.lng}>
                            <input type="number" step="any" value={form.data.lng} onChange={(e) => form.setData('lng', e.target.value)} className={inputCls} />
                        </Field>
                    </div>
                    <Field label="Radius Absensi (m)" error={form.errors.radius_m}>
                        <input type="number" value={form.data.radius_m} onChange={(e) => form.setData('radius_m', e.target.value)} className={inputCls} />
                    </Field>
                    <div className="grid grid-cols-3 gap-4">
                        <Field label="Jam Masuk" error={form.errors.jam_masuk}>
                            <input type="time" value={form.data.jam_masuk} onChange={(e) => form.setData('jam_masuk', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Batas Terlambat" error={form.errors.batas_terlambat}>
                            <input type="time" value={form.data.batas_terlambat} onChange={(e) => form.setData('batas_terlambat', e.target.value)} className={inputCls} />
                        </Field>
                        <Field label="Jam Pulang" error={form.errors.jam_pulang}>
                            <input type="time" value={form.data.jam_pulang} onChange={(e) => form.setData('jam_pulang', e.target.value)} className={inputCls} />
                        </Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={!!form.data.aktif} onChange={(e) => form.setData('aktif', e.target.checked)} className="rounded border-gray-300 text-blue-600" />
                        Kantor aktif
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">Batal</button>
                        <button type="submit" disabled={form.processing} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60">
                            <Save className="w-4 h-4" /> {form.processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Semua setting mentah (key/value)                                    */
/* ------------------------------------------------------------------ */
function RawSettings({ rows }) {
    if (!rows || rows.length === 0) return null;
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Semua Setting (key / value)</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr>
                        <th className="text-left py-2 px-4 font-medium text-gray-600">Key</th>
                        <th className="text-left py-2 px-4 font-medium text-gray-600">Value</th>
                    </tr></thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.key} className="border-t border-gray-100">
                                <td className="py-2 px-4 font-mono text-xs text-gray-700">{r.key}</td>
                                <td className="py-2 px-4 text-gray-800">{r.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
const inputCls = 'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-xs font-medium text-gray-600">{label}</label>
            {children}
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}
