import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Printer } from 'lucide-react';

const fmtKm = (v) =>
    new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(v || 0);

export default function Bulanan({ laporan, bulan, periode, totals }) {
    return (
        <AppLayout title="Rekap KM Alat Berat">
            <Head title="Rekap KM Alat Berat" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Pilih bulan:</label>
                    <input
                        type="month"
                        value={bulan}
                        onChange={(e) => router.get('/laporan-km/bulanan', { bulan: e.target.value }, { preserveState: true })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                    <Printer className="w-4 h-4" /> Cetak
                </button>
            </div>

            <div className="mb-3">
                <h2 className="text-base font-semibold text-gray-800">Rekap Pemakaian KM — Bulan: {periode}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                    KM Sebelumnya = akumulasi pemakaian sampai akhir bulan lalu. KM s/d Bulan = KM Sebelumnya + Bulan Ini.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[50px]">No</th>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[120px]">Kode</th>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[180px]">Nama Alat</th>
                                <th className="text-left py-2.5 px-3 font-medium text-gray-600 min-w-[120px]">Jenis</th>
                                <th className="text-right py-2.5 px-3 font-medium text-gray-600 min-w-[130px]">KM Sebelumnya</th>
                                <th className="text-right py-2.5 px-3 font-medium text-blue-700 min-w-[120px]">KM Bulan Ini</th>
                                <th className="text-right py-2.5 px-3 font-medium text-green-700 min-w-[130px]">KM s/d Bulan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-6 text-gray-400">Belum ada data alat berat.</td></tr>
                            )}
                            {laporan.map((row, i) => (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                                    <td className="py-2.5 px-3 font-medium text-gray-800">{row.kode_alat}</td>
                                    <td className="py-2.5 px-3 text-gray-700">{row.nama_alat}</td>
                                    <td className="py-2.5 px-3 text-gray-500">{row.jenis || '-'}</td>
                                    <td className="text-right py-2.5 px-3 text-gray-700 tabular-nums">{fmtKm(row.km_sebelumnya)}</td>
                                    <td className="text-right py-2.5 px-3 text-blue-700 font-medium tabular-nums">
                                        {row.km_bulan_ini > 0 ? fmtKm(row.km_bulan_ini) : <span className="text-gray-300">0</span>}
                                    </td>
                                    <td className="text-right py-2.5 px-3 text-green-700 font-semibold tabular-nums">{fmtKm(row.km_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        {laporan.length > 0 && (
                            <tfoot className="bg-gray-50 border-t border-gray-200 font-semibold">
                                <tr>
                                    <td className="py-2.5 px-3" colSpan={4}>Total</td>
                                    <td className="text-right py-2.5 px-3 text-gray-800 tabular-nums">{fmtKm(totals.km_sebelumnya)}</td>
                                    <td className="text-right py-2.5 px-3 text-blue-700 tabular-nums">{fmtKm(totals.km_bulan_ini)}</td>
                                    <td className="text-right py-2.5 px-3 text-green-700 tabular-nums">{fmtKm(totals.km_total)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
