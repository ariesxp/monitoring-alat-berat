import AppLayout from '../../layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { fmt, PeriodeFilter, BalanceBadge, ReportCard } from './shared';

export default function NeracaSaldo({ filters, neracaSaldo: data }) {
    const balanced = Math.abs(data.totalDebit - data.totalCredit) < 0.01;

    return (
        <AppLayout title="Neraca Saldo">
            <Head title="Neraca Saldo" />
            <PeriodeFilter route="/neraca-saldo" filters={filters} />

            <ReportCard title="Neraca Saldo" subtitle="Saldo debit / kredit per akun (posting level)" badge={<BalanceBadge balanced={balanced} />}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left py-2.5 px-4 font-medium w-24">Kode</th>
                                <th className="text-left py-2.5 px-4 font-medium">Nama Akun</th>
                                <th className="text-right py-2.5 px-4 font-medium w-40">Debit</th>
                                <th className="text-right py-2.5 px-4 font-medium w-40">Kredit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((r) => (
                                <tr key={r.code} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-4 font-mono text-xs text-gray-500">{r.code}</td>
                                    <td className="py-2 px-4">{r.name}</td>
                                    <td className="py-2 px-4 text-right tabular-nums">{fmt(r.debit)}</td>
                                    <td className="py-2 px-4 text-right tabular-nums">{fmt(r.credit)}</td>
                                </tr>
                            ))}
                            {data.rows.length === 0 && (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-400">Belum ada mutasi pada periode ini</td></tr>
                            )}
                        </tbody>
                        <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-300">
                            <tr>
                                <td colSpan={2} className="py-3 px-4 text-right text-gray-700">TOTAL</td>
                                <td className="py-3 px-4 text-right tabular-nums text-green-700">{fmt(data.totalDebit)}</td>
                                <td className="py-3 px-4 text-right tabular-nums text-red-700">{fmt(data.totalCredit)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </ReportCard>
        </AppLayout>
    );
}
