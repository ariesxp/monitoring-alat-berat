import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

const statusOptions = ['hadir', 'sakit', 'izin', 'alpha', 'cuti', 'libur'];
const statusColors = { hadir: 'bg-green-100 text-green-700', sakit: 'bg-red-100 text-red-700', izin: 'bg-yellow-100 text-yellow-700', alpha: 'bg-gray-100 text-gray-600', cuti: 'bg-blue-100 text-blue-700', libur: 'bg-purple-100 text-purple-700' };

export default function Index({ operators, absensi, bulan }) {
    const [selectedOp, setSelectedOp] = useState(null);
    const { data, setData, post, processing } = useForm({
        operator_id: '', tanggal: new Date().toISOString().split('T')[0], jam_masuk: '08:00', jam_pulang: '17:00', status: 'hadir', keterangan: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/absensi', { preserveScroll: true, onSuccess: () => setSelectedOp(null) });
    };

    const getAbsensi = (opId, date) => {
        const records = absensi[opId] || [];
        return records.find(a => a.tanggal === date);
    };

    const daysInMonth = new Date(bulan.split('-')[0], bulan.split('-')[1], 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => `${bulan}-${String(i + 1).padStart(2, '0')}`);

    return (
        <AppLayout title="Absensi">
            <Head title="Absensi" />
            <div className="flex gap-3 mb-4">
                <input type="month" value={bulan} onChange={(e) => router.get('/absensi', { bulan: e.target.value }, { preserveState: true })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>

            {selectedOp && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <h3 className="text-sm font-semibold mb-3">Input Absensi: {operators.find(o => o.id === selectedOp)?.nama}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                        <input type="hidden" value={data.operator_id} />
                        <div><label className="text-xs text-gray-500">Tanggal</label><input type="date" value={data.tanggal} onChange={(e) => setData('tanggal', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                        <div><label className="text-xs text-gray-500">Jam Masuk</label><input type="time" value={data.jam_masuk} onChange={(e) => setData('jam_masuk', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                        <div><label className="text-xs text-gray-500">Jam Pulang</label><input type="time" value={data.jam_pulang} onChange={(e) => setData('jam_pulang', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm" /></div>
                        <div><label className="text-xs text-gray-500">Status</label><select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-2 py-1.5 border rounded text-sm">{statusOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                        <div className="flex items-end gap-2">
                            <button type="submit" disabled={processing} className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50">Simpan</button>
                            <button type="button" onClick={() => setSelectedOp(null)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-sm rounded">Batal</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-2 px-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[150px]">Nama</th>
                            {days.map(d => <th key={d} className="text-center py-2 px-1 font-medium text-gray-600 min-w-[30px]">{parseInt(d.split('-')[2])}</th>)}
                        </tr></thead>
                        <tbody>
                            {operators.map(op => (
                                <tr key={op.id} className="border-t border-gray-100">
                                    <td className="py-2 px-3 font-medium sticky left-0 bg-white cursor-pointer hover:text-blue-600" onClick={() => { setSelectedOp(op.id); setData({ ...data, operator_id: op.id }); }}>{op.nama}</td>
                                    {days.map(d => {
                                        const abs = getAbsensi(op.id, d);
                                        return <td key={d} className="text-center py-2 px-1">{abs ? <span className={`inline-block w-5 h-5 rounded text-[10px] leading-5 ${statusColors[abs.status]}`}>{abs.status[0].toUpperCase()}</span> : <span className="text-gray-300">-</span>}</td>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
