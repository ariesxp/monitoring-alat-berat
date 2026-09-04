import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';

const statusLabels = { hadir: 'Hadir', sakit: 'Sakit', izin: 'Izin', alpha: 'Alpha', cuti: 'Cuti', libur: 'Libur' };
const statusHeadColors = {
    hadir: 'text-green-700', sakit: 'text-red-700', izin: 'text-yellow-700',
    alpha: 'text-gray-600', cuti: 'text-blue-700', libur: 'text-purple-700',
};

export default function Bulanan({ laporan, bulan, periode, statuses, totals }) {
    return (
        <AppLayout title="Laporan Absensi Bulanan">
            <Head title="Laporan Absensi Bulanan" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Pilih bulan:</label>
                    <input
                        type="month"
                        value={bulan}
                        onChange={(e) => router.get('/laporan-absensi/bulanan', { bulan: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    <Printer className="w-4 h-4" /> Cetak
                </button>
            </div>

            <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-800">Rekap Bulan: {periode}</h2>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[50px]">No</th>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[180px]">Nama</th>
                                {statuses.map((s) => (
                                    <th key={s} className={`text-center py-2.5 px-3 font-medium ${statusHeadColors[s]}`}>{statusLabels[s]}</th>
                                ))}
                                <th className="text-center py-2.5 px-3 font-medium text-gray-600">Hari Kerja</th>
                                <th className="text-center py-2.5 px-3 font-medium text-gray-600">% Hadir</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 && (
                                <tr><td colSpan={statuses.length + 4} className="text-center py-6 text-gray-400">Belum ada operator aktif.</td></tr>
                            )}
                            {laporan.map((row, i) => (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                                    <td className="py-2.5 px-3 font-medium text-gray-800">
                                        {row.nama}
                                        {row.jabatan && <div className="text-xs text-gray-400 font-normal">{row.jabatan}</div>}
                                    </td>
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2.5 px-3 text-gray-700">{row.counts[s] || <span className="text-gray-300">0</span>}</td>
                                    ))}
                                    <td className="text-center py-2.5 px-3 text-gray-700">{row.hari_kerja}</td>
                                    <td className="text-center py-2.5 px-3">
                                        <span className={`font-medium ${row.persentase >= 90 ? 'text-green-600' : row.persentase >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>{row.persentase}%</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        {laporan.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                                <tr>
                                    <td className="py-2.5 px-3"></td>
                                    <td className="py-2.5 px-3 text-gray-800">Total</td>
                                    {statuses.map((s) => (
                                        <td key={s} className="text-center py-2.5 px-3 text-gray-800">{totals[s]}</td>
                                    ))}
                                    <td colSpan={2}></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
