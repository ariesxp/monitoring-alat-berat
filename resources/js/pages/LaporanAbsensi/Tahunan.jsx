import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';

const statusLabels = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpha: 'Alpha', cuti: 'Cuti', libur: 'Libur' };
const statusHeadColors = {
    hadir: 'text-green-700', sakit: 'text-red-700', izin: 'text-yellow-700',
    alpha: 'text-gray-600', cuti: 'text-blue-700', libur: 'text-purple-700',
};

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function Tahunan({ laporan, tahun, bulanLabels, statuses, totals }) {
    return (
        <AppLayout title="Laporan Absensi Tahunan">
            <Head title="Laporan Absensi Tahunan" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Pilih tahun:</label>
                    <select
                        value={tahun}
                        onChange={(e) => router.get('/laporan-absensi/tahunan', { tahun: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    <Printer className="w-4 h-4" /> Cetak
                </button>
            </div>

            <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-800">Tahun {tahun}</h2>
            </div>

            {/* Matriks kehadiran per bulan */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700">Jumlah Hadir per Bulan</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2 px-3 font-medium text-gray-600 sticky left-0 bg-gray-50 min-w-[150px] border-r border-gray-200">Nama</th>
                                {bulanLabels.map((b, i) => (
                                    <th key={i} className="text-center py-2 px-2 font-medium text-gray-600 min-w-[40px]">{b}</th>
                                ))}
                                <th className="text-center py-2 px-3 font-medium text-gray-700 border-l border-gray-200 bg-green-50">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 && (
                                <tr><td colSpan={14} className="text-center py-6 text-gray-400">Belum ada operator aktif.</td></tr>
                            )}
                            {laporan.map((row) => (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-3 font-medium sticky left-0 bg-white border-r border-gray-200">{row.nama}</td>
                                    {row.hadir_per_bulan.map((v, i) => (
                                        <td key={i} className="text-center py-2 px-2 text-gray-700">{v || <span className="text-gray-300">0</span>}</td>
                                    ))}
                                    <td className="text-center py-2 px-3 font-semibold text-green-700 border-l border-gray-200 bg-green-50/50">{row.total_hadir}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rekap status setahun */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-700">Rekap Status Setahun</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[180px]">Nama</th>
                                {statuses.map((s) => (
                                    <th key={s} className={`text-center py-2.5 px-3 font-medium ${statusHeadColors[s]}`}>{statusLabels[s]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.map((row) => (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2.5 px-3 font-medium text-gray-800">{row.nama}</td>
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2.5 px-3 text-gray-700">{row.counts[s] || <span className="text-gray-300">0</span>}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {laporan.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                                <tr>
                                    <td className="py-2.5 px-3 text-gray-800">Total</td>
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2.5 px-3 text-gray-800">{totals[s]}</td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
