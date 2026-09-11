import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Fragment } from 'react';
import { Printer, FileSpreadsheet, FileText } from 'lucide-react';

const statusColors = {
    hadir: 'text-green-700', sakit: 'text-red-600', izin: 'text-yellow-700',
    alpha: 'text-gray-500', cuti: 'text-blue-700', libur: 'text-purple-700',
};
const statusSingkat = { sakit: 'S', izin: 'I', alpha: 'A', cuti: 'C', libur: 'L' };

const jam = (v) => (v ? String(v).slice(0, 5) : '');

// Sel In/Out: tampilkan jam bila ada; bila status non-hadir tampilkan kode; selain itu strip.
function Sel({ data, field }) {
    const t = jam(data?.[field]);
    if (t) return <span className="tabular-nums text-gray-700">{t}</span>;
    if (data?.status && data.status !== 'hadir') {
        return <span className={`font-medium ${statusColors[data.status]}`}>{statusSingkat[data.status] || '-'}</span>;
    }
    return <span className="text-gray-300">-</span>;
}

export default function Harian({ laporan, hari, periode, operators, operatorId, dari, sampai, departemenList = [], departemen }) {
    const cols = hari.length;

    const applyFilter = (next) => {
        const params = {
            ...(departemen ? { departemen } : {}),
            ...(operatorId ? { operator_id: operatorId } : {}),
            ...(dari ? { dari } : {}),
            ...(sampai ? { sampai } : {}),
            ...next,
        };
        // Buang nilai kosong agar URL bersih.
        Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
        router.get('/laporan-absensi/harian', params, { preserveState: true });
    };

    const exportUrl = (format) => {
        const p = new URLSearchParams({ format });
        if (departemen) p.set('departemen', departemen);
        if (operatorId) p.set('operator_id', operatorId);
        if (dari) p.set('dari', dari);
        if (sampai) p.set('sampai', sampai);
        return `/laporan-absensi/harian/export?${p.toString()}`;
    };

    return (
        <AppLayout title="Laporan Absensi Harian">
            <Head title="Laporan Absensi Harian" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 print:hidden">
                <div className="flex flex-wrap items-center gap-2">
                    <label className="text-sm text-gray-600">Departemen:</label>
                    <select
                        value={departemen || ''}
                        onChange={(e) => applyFilter({ departemen: e.target.value, operator_id: '' })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">Semua Departemen</option>
                        {departemenList.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <label className="text-sm text-gray-600 ml-2">Operator:</label>
                    <select
                        value={operatorId || ''}
                        onChange={(e) => applyFilter({ operator_id: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                        <option value="">Semua Operator</option>
                        {operators.map((o) => <option key={o.id} value={o.id}>{o.nama}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <a href={exportUrl('excel')} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                        <FileSpreadsheet className="w-4 h-4" /> Excel
                    </a>
                    <a href={exportUrl('pdf')} className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
                        <FileText className="w-4 h-4" /> PDF
                    </a>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        <Printer className="w-4 h-4" /> Cetak
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4 print:hidden">
                <label className="text-sm text-gray-600">Dari tanggal:</label>
                <input
                    type="date"
                    value={dari || ''}
                    onChange={(e) => applyFilter({ dari: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <label className="text-sm text-gray-600">Sampai tanggal:</label>
                <input
                    type="date"
                    value={sampai || ''}
                    onChange={(e) => applyFilter({ sampai: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                {(dari || sampai) && (
                    <button
                        type="button"
                        onClick={() => applyFilter({ dari: '', sampai: '' })}
                        className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Reset rentang
                    </button>
                )}
            </div>

            <div className="mb-4">
                <h2 className="text-base font-semibold text-gray-800">Laporan Absensi Harian</h2>
                <p className="text-sm text-gray-500">Periode: {periode.mulai} – {periode.selesai}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th rowSpan={3} className="py-2 px-2 font-medium text-gray-600 border border-gray-200 sticky left-0 bg-gray-50 w-10">No.</th>
                                <th rowSpan={3} className="py-2 px-3 font-medium text-gray-600 border border-gray-200 text-left sticky left-10 bg-gray-50 min-w-[160px]">Nama</th>
                                {hari.map((h) => (
                                    <th key={h.tanggal} colSpan={2} className="py-1.5 px-2 font-medium text-gray-600 border border-gray-200 text-center min-w-[90px]">Tanggal</th>
                                ))}
                                <th rowSpan={3} className="py-2 px-2 font-medium text-gray-600 border border-gray-200 text-center min-w-[70px]">Total Kehadiran</th>
                            </tr>
                            <tr className="bg-gray-50">
                                {hari.map((h) => (
                                    <th key={h.tanggal} colSpan={2} className="py-1 px-2 font-normal text-gray-500 border border-gray-200 text-center">
                                        <div className="text-[11px] text-gray-700">{h.label}</div>
                                        <div className="text-[10px] text-gray-400">{h.hari}</div>
                                    </th>
                                ))}
                            </tr>
                            <tr className="bg-gray-50">
                                {hari.map((h) => (
                                    <Fragment key={h.tanggal}>
                                        <th className="py-1 px-2 font-medium text-gray-500 border border-gray-200 text-center min-w-[45px]">In</th>
                                        <th className="py-1 px-2 font-medium text-gray-500 border border-gray-200 text-center min-w-[45px]">Out</th>
                                    </Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {laporan.length === 0 && (
                                <tr><td colSpan={cols * 2 + 3} className="text-center py-6 text-gray-400 border border-gray-200">Belum ada operator aktif.</td></tr>
                            )}
                            {laporan.map((op) => (
                                <tr key={op.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-2 text-center text-gray-500 border border-gray-200 sticky left-0 bg-white">{op.no}</td>
                                    <td className="py-2 px-3 border border-gray-200 sticky left-10 bg-white">
                                        <div className="font-medium text-gray-800">{op.nama}</div>
                                        {op.jabatan && <div className="text-[10px] text-gray-400">{op.jabatan}</div>}
                                    </td>
                                    {hari.map((h) => {
                                        const d = op.harian[h.tanggal];
                                        return (
                                            <Fragment key={h.tanggal}>
                                                <td className="py-2 px-2 text-center border border-gray-200"><Sel data={d} field="in" /></td>
                                                <td className="py-2 px-2 text-center border border-gray-200"><Sel data={d} field="out" /></td>
                                            </Fragment>
                                        );
                                    })}
                                    <td className="py-2 px-2 text-center border border-gray-200 font-semibold text-gray-800">{op.total_kehadiran}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
                Keterangan: <span className="text-red-600 font-medium">S</span>=Sakit, <span className="text-yellow-700 font-medium">I</span>=Izin, <span className="text-gray-500 font-medium">A</span>=Alpha, <span className="text-blue-700 font-medium">C</span>=Cuti, <span className="text-purple-700 font-medium">L</span>=Libur. Jam ditampilkan untuk kehadiran.
            </div>
        </AppLayout>
    );
}
