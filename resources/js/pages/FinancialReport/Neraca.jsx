import AppLayout from '../../layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { fmt, PeriodeFilter, BalanceBadge, ReportCard } from './shared';

export default function Neraca({ filters, neraca: data }) {
    const Col = ({ title, children }) => (
        <div className="flex-1 min-w-[280px]">
            <div className="px-4 py-2 bg-gray-100 font-semibold text-gray-700 uppercase text-xs tracking-wider rounded-t-lg">{title}</div>
            <table className="w-full text-sm">
                <tbody>{children}</tbody>
            </table>
        </div>
    );
    const Line = ({ code, name, amount, pl }) => (
        <tr className="border-t border-gray-100">
            <td className="py-2 px-4 font-mono text-xs text-gray-500 w-20">{code}</td>
            <td className={`py-2 px-4 ${pl ? 'pl-6' : ''}`}>{name}</td>
            <td className="py-2 px-4 text-right tabular-nums w-40">{fmt(amount)}</td>
        </tr>
    );
    const Total = ({ label, value, strong }) => (
        <tr className={`border-t-2 border-gray-300 ${strong ? 'bg-blue-50 font-bold text-blue-800' : 'bg-gray-50 font-semibold text-gray-800'}`}>
            <td colSpan={2} className="py-2.5 px-4 text-right">{label}</td>
            <td className="py-2.5 px-4 text-right tabular-nums">{fmt(value)}</td>
        </tr>
    );

    return (
        <AppLayout title="Neraca">
            <Head title="Neraca" />
            <PeriodeFilter route="/neraca" filters={filters} />

            <ReportCard title="Neraca" subtitle="Posisi keuangan: Aktiva = Kewajiban + Ekuitas" badge={<BalanceBadge balanced={data.balanced} />}>
                <div className="flex flex-col lg:flex-row gap-4 p-4">
                    {/* AKTIVA */}
                    <Col title="Aktiva">
                        {data.aktiva.lines.map((l) => <Line key={l.code} {...l} />)}
                        {data.aktiva.lines.length === 0 && <tr className="border-t border-gray-100"><td colSpan={3} className="py-2 px-4 text-gray-400 text-xs">Tidak ada</td></tr>}
                        <Total label="TOTAL AKTIVA" value={data.totalAktiva} strong />
                    </Col>

                    {/* PASIVA */}
                    <Col title="Kewajiban & Ekuitas">
                        <tr className="bg-gray-50"><td colSpan={3} className="py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase">Kewajiban</td></tr>
                        {data.kewajiban.lines.map((l) => <Line key={l.code} {...l} pl />)}
                        {data.kewajiban.lines.length === 0 && <tr className="border-t border-gray-100"><td colSpan={3} className="py-2 px-4 pl-6 text-gray-400 text-xs">Tidak ada</td></tr>}
                        <tr className="border-t border-gray-200 font-medium">
                            <td colSpan={2} className="py-2 px-4 text-right text-gray-600">Total Kewajiban</td>
                            <td className="py-2 px-4 text-right tabular-nums">{fmt(data.kewajiban.total)}</td>
                        </tr>

                        <tr className="bg-gray-50"><td colSpan={3} className="py-1.5 px-4 text-xs font-semibold text-gray-600 uppercase">Ekuitas</td></tr>
                        {data.ekuitas.lines.map((l) => <Line key={l.code} {...l} pl />)}
                        <tr className="border-t border-gray-100">
                            <td className="py-2 px-4 font-mono text-xs text-gray-500 w-20">—</td>
                            <td className="py-2 px-4 pl-6">Laba (Rugi) Tahun Berjalan</td>
                            <td className="py-2 px-4 text-right tabular-nums w-40">{fmt(data.labaBerjalan)}</td>
                        </tr>
                        <tr className="border-t border-gray-200 font-medium">
                            <td colSpan={2} className="py-2 px-4 text-right text-gray-600">Total Ekuitas</td>
                            <td className="py-2 px-4 text-right tabular-nums">{fmt(data.totalEkuitas)}</td>
                        </tr>
                        <Total label="TOTAL PASIVA" value={data.totalPasiva} strong />
                    </Col>
                </div>
            </ReportCard>
        </AppLayout>
    );
}
