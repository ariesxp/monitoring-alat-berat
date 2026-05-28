import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Index({ jamKerjaPerAlat, biayaPerBulan, kontrakPerStatus, utilisasiAlat, bbmPerBulan, tahun }) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const bbmData = {
        labels: Object.keys(bbmPerBulan || {}).map(b => months[parseInt(b.split('-')[1]) - 1]),
        datasets: [{ label: 'BBM (liter)', data: Object.values(bbmPerBulan || {}), backgroundColor: '#f59e0b', borderRadius: 6 }],
    };

    const utilisasiData = {
        labels: Object.keys(utilisasiAlat || {}).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{ data: Object.values(utilisasiAlat || {}), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], borderWidth: 0 }],
    };

    return (
        <AppLayout title="Statistik">
            <Head title="Statistik" />
            <div className="flex gap-3 mb-6">
                <select value={tahun} onChange={(e) => router.get('/statistik', { tahun: e.target.value }, { preserveState: true })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Konsumsi BBM per Bulan</h3>
                    <div className="h-64"><Bar data={bbmData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Utilisasi Alat Berat</h3>
                    <div className="h-64 flex items-center justify-center"><Doughnut data={utilisasiData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Jam Kerja per Alat</h3>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-2 text-gray-500">Alat</th><th className="text-right py-2 text-gray-500">Total Jam</th><th className="text-right py-2 text-gray-500">Total BBM</th></tr></thead>
                        <tbody>{(jamKerjaPerAlat || []).map(j => (
                            <tr key={j.alat_berat_id} className="border-b border-gray-50"><td className="py-2">{j.alat_berat?.nama_alat}</td><td className="py-2 text-right font-medium">{parseFloat(j.total_jam).toFixed(1)} jam</td><td className="py-2 text-right">{parseFloat(j.total_bbm).toFixed(1)} ltr</td></tr>
                        ))}</tbody>
                    </table>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Kontrak per Status</h3>
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-2 text-gray-500">Status</th><th className="text-right py-2 text-gray-500">Jumlah</th><th className="text-right py-2 text-gray-500">Nilai</th></tr></thead>
                        <tbody>{(kontrakPerStatus || []).map(k => (
                            <tr key={k.status} className="border-b border-gray-50"><td className="py-2 capitalize">{k.status}</td><td className="py-2 text-right">{k.total}</td><td className="py-2 text-right font-medium">{formatRp(k.nilai)}</td></tr>
                        ))}</tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
