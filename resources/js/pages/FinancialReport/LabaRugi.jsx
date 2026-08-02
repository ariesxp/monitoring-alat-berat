import AppLayout from '../../layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { fmt, PeriodeFilter, ReportCard } from './shared';

export default function LabaRugi({ filters, labaRugi: data }) {
    const Section = ({ label, group }) => (
        <>
            <tr className="bg-gray-50">
                <td colSpan={3} className="py-2 px-4 font-semibold text-gray-700 uppercase text-xs tracking-wider">{label}</td>
            </tr>
            {group.lines.length === 0 && (
                <tr className="border-t border-gray-100"><td colSpan={3} className="py-2 px-4 pl-8 text-gray-400 text-xs">Tidak ada</td></tr>
            )}
            {group.lines.map((l) => (
                <tr key={l.code} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4 pl-8 font-mono text-xs text-gray-500 w-24">{l.code}</td>
                    <td className="py-2 px-4">{l.name}</td>
                    <td className="py-2 px-4 text-right tabular-nums w-48">{fmt(l.amount)}</td>
                </tr>
            ))}
            <tr className="border-t border-gray-200 font-medium bg-gray-50/50">
                <td colSpan={2} className="py-2 px-4 text-right text-gray-600 text-sm">Total {label}</td>
                <td className="py-2 px-4 text-right tabular-nums">{fmt(group.total)}</td>
            </tr>
        </>
    );

    const SubtotalRow = ({ label, value, strong }) => (
        <tr className={`border-t-2 border-gray-300 ${strong ? 'bg-blue-50' : 'bg-gray-100'}`}>
            <td colSpan={2} className={`py-2.5 px-4 text-right ${strong ? 'font-bold text-blue-800' : 'font-semibold text-gray-800'}`}>{label}</td>
            <td className={`py-2.5 px-4 text-right tabular-nums ${strong ? 'font-bold text-blue-800' : 'font-semibold text-gray-800'}`}>{fmt(value)}</td>
        </tr>
    );

    return (
        <AppLayout title="Laba Rugi">
            <Head title="Laba Rugi" />
            <PeriodeFilter route="/laba-rugi" filters={filters} />

            <ReportCard title="Laporan Laba Rugi" subtitle="Pendapatan dikurangi beban selama periode">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <tbody>
                            <Section label="Pendapatan" group={data.pendapatan} />
                            <Section label="Beban Pokok Pendapatan" group={data.hpp} />
                            <SubtotalRow label="LABA KOTOR" value={data.labaKotor} />
                            <Section label="Beban Operasional" group={data.bebanOperasional} />
                            <SubtotalRow label="LABA USAHA" value={data.labaUsaha} />
                            <Section label="Pendapatan Lain-lain" group={data.pendapatanLain} />
                            <Section label="Beban Lain-lain" group={data.bebanLain} />
                            <SubtotalRow label="LABA (RUGI) BERSIH" value={data.labaBersih} strong />
                        </tbody>
                    </table>
                </div>
            </ReportCard>
        </AppLayout>
    );
}
