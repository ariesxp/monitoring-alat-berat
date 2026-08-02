import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

export const fmt = (v) => {
    const n = Math.round(Number(v) || 0);
    if (Math.abs(n) === 0) return '-';
    const s = new Intl.NumberFormat('id-ID').format(Math.abs(n));
    return n < 0 ? `(${s})` : s;
};

export function PeriodeFilter({ route, filters }) {
    const [start, setStart] = useState(filters.start_date || '');
    const [end, setEnd] = useState(filters.end_date || '');

    const apply = () => router.get(route, {
        start_date: start || undefined,
        end_date: end || undefined,
    }, { preserveState: true, preserveScroll: true, replace: true });

    const reset = () => {
        setStart('');
        setEnd('');
        router.get(route, {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const periodeLabel = filters.start_date || filters.end_date
        ? `Periode: ${filters.start_date || '…'} s/d ${filters.end_date || '…'}`
        : 'Periode: Seluruh data';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex flex-wrap items-end gap-3">
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Dari Tanggal</label>
                    <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sampai Tanggal</label>
                    <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={apply} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Filter className="w-4 h-4" /> Terapkan
                </button>
                {(filters.start_date || filters.end_date) && (
                    <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
                        <X className="w-4 h-4" /> Reset
                    </button>
                )}
                <span className="ml-auto text-xs text-gray-500">{periodeLabel}</span>
            </div>
        </div>
    );
}

export function BalanceBadge({ balanced }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${balanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {balanced ? 'BALANCE' : 'TIDAK BALANCE'}
        </span>
    );
}

export function ReportCard({ title, subtitle, badge, children }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{title}</h2>
                    {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
                </div>
                {badge}
            </div>
            {children}
        </div>
    );
}
