import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';

const statusLabels = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpha: 'Alpha', cuti: 'Cuti', libur: 'Libur' };
const statusColors = {
    hadir: 'bg-green-100 text-green-700', sakit: 'bg-red-100 text-red-700', izin: 'bg-yellow-100 text-yellow-700',
    alpha: 'bg-gray-200 text-gray-600', cuti: 'bg-blue-100 text-blue-700', libur: 'bg-purple-100 text-purple-700',
};

export default function Mingguan({ laporan, hari, periode, statuses, totals }) {
    return (
        <AppLayout title="Laporan Absensi Mingguan">
            <Head title="Laporan Absensi Mingguan" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Pilih minggu (tanggal):</label>
                    <input
                        type="date"
                        value={periode.tanggal}
                        onChange={(e) => router.get('/laporan-absensi/mingguan', { tanggal: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    <Printer className="w-4 h-4" /> Cetak
                </button>
            </div>

            <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-800">Periode: {periode.mulai} – {periode.selesai}</h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th rowSpan={2} className="text-left py-2 px-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[150px] border-r border-gray-200">Nama</th>
                                {hari.map((h) => (
                                    <th key={h.tanggal} className="text-center py-2 px-2 font-medium text-gray-600 min-w-[52px] border-r border-gray-100">
                                        <div>{h.hari}</div>
                                        <div className="text-[10px] text-gray-400 font-normal">{h.label}</div>
                                    </th>
                                ))}
                                {statuses.map((s) => (
                                    <th key={s} className="text-center py-2 px-2 font-medium text-gray-600 min-w-[44px]">{statusLabels[s]}</th>
                                ))}
                            </tr>
                            <tr></tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 && (
                                <tr><td colSpan={hari.length + statuses.length + 1} className="text-center py-6 text-gray-400">Belum ada operator aktif.</td></tr>
                            )}
                            {laporan.map((row) => (
                                <tr key={row.id} className="border-t border-gray-100">
                                    <td className="py-2 px-3 font-medium sticky left-0 bg-white border-r border-gray-200">
                                        {row.nama}
                                        {row.jabatan && <div className="text-[10px] text-gray-400 font-normal">{row.jabatan}</div>}
                                    </td>
                                    {hari.map((h) => {
                                        const abs = row.harian[h.tanggal];
                                        return (
                                            <td key={h.tanggal} className="text-center py-2 px-2 border-r border-gray-100">
                                                {abs
                                                    ? <span title={abs.jam_masuk ? `${abs.jam_masuk} - ${abs.jam_pulang || ''}` : ''} className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium ${statusColors[abs.status]}`}>{abs.status[0].toUpperCase()}</span>
                                                    : <span className="text-gray-300">-</span>}
                                            </td>
                                        );
                                    })}
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2 px-2 text-gray-700">{row.counts[s] || <span className="text-gray-300">0</span>}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {laporan.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                                <tr>
                                    <td className="py-2 px-3 sticky left-0 bg-gray-50 border-r border-gray-200">Total</td>
                                    <td colSpan={hari.length} className="border-r border-gray-100"></td>
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2 px-2 text-gray-800">{totals[s]}</td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                {statuses.map((s) => (
                    <span key={s} className="inline-flex items-center gap-1">
                        <span className={`inline-block w-4 h-4 rounded text-[9px] leading-4 text-center font-medium ${statusColors[s]}`}>{s[0].toUpperCase()}</span>
                        {statusLabels[s]}
                    </span>
                ))}
            </div>
        </AppLayout>
    );
}
