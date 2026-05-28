import AppLayout from '../layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FileText, Truck, ClipboardList, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

function StatCard({ label, value, icon: Icon, color = 'blue', sub }) {
    const themes = {
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200',
        green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200',
        yellow: 'bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200',
        red: 'bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-200',
        purple: 'bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-200',
    };
    const iconThemes = {
        blue: 'bg-blue-200/60 text-blue-600',
        green: 'bg-emerald-200/60 text-emerald-600',
        yellow: 'bg-amber-200/60 text-amber-600',
        red: 'bg-rose-200/60 text-rose-600',
        purple: 'bg-violet-200/60 text-violet-600',
    };

    return (
        <div className={`rounded-xl p-5 ${themes[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm opacity-75">{label}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {sub && <p className="text-xs opacity-60 mt-1">{sub}</p>}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconThemes[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}

function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

export default function Dashboard({ stats, status_alat, biaya_per_kategori, biaya_bulanan, laporan_terbaru, bulan }) {
    const statusLabels = { tersedia: 'Tersedia', beroperasi: 'Beroperasi', maintenance: 'Maintenance', rusak: 'Rusak' };
    const statusColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const doughnutData = {
        labels: Object.keys(status_alat || {}).map(k => statusLabels[k] || k),
        datasets: [{
            data: Object.values(status_alat || {}),
            backgroundColor: statusColors.slice(0, Object.keys(status_alat || {}).length),
            borderWidth: 0,
        }],
    };

    const kategoriLabels = { bbm: 'BBM', sparepart: 'Sparepart', maintenance: 'Maintenance', transport: 'Transport', lainnya: 'Lainnya' };
    const barData = {
        labels: Object.keys(biaya_bulanan || {}).map(b => {
            const [y, m] = b.split('-');
            const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return months[parseInt(m)];
        }),
        datasets: [{
            label: 'Biaya Operasional',
            data: Object.values(biaya_bulanan || {}),
            backgroundColor: '#3b82f6',
            borderRadius: 6,
        }],
    };

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Kontrak Aktif" value={stats.kontrak_aktif} icon={FileText} color="blue" />
                <StatCard label="Alat Beroperasi" value={`${stats.alat_beroperasi}/${stats.total_alat}`} icon={Truck} color="green" />
                <StatCard label="SPK Aktif" value={stats.spk_aktif} icon={ClipboardList} color="purple" />
                <StatCard label="Stok Menipis" value={stats.stok_menipis} icon={AlertTriangle} color={stats.stok_menipis > 0 ? 'red' : 'green'} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <StatCard label="Pendapatan Kontrak" value={formatRupiah(stats.pendapatan_bulan)} icon={TrendingUp} color="green" sub="Total nilai kontrak aktif" />
                <StatCard label="Biaya Operasional" value={formatRupiah(stats.biaya_bulan)} icon={TrendingDown} color="red" sub="Bulan ini" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Biaya Operasional per Bulan</h3>
                    <div className="h-64">
                        <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Alat Berat</h3>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Laporan Harian Terbaru</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Tanggal</th>
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">SPK</th>
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Alat</th>
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Operator</th>
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Jam Kerja</th>
                                <th className="text-left py-2 px-3 text-gray-500 font-medium">BBM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(laporan_terbaru || []).map((l) => (
                                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-2 px-3">{new Date(l.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td className="py-2 px-3 font-mono text-xs">{l.spk?.nomor_spk}</td>
                                    <td className="py-2 px-3">{l.alat_berat?.nama_alat}</td>
                                    <td className="py-2 px-3">{l.operator?.nama}</td>
                                    <td className="py-2 px-3">{l.jam_kerja} jam</td>
                                    <td className="py-2 px-3">{l.bbm_liter} ltr</td>
                                </tr>
                            ))}
                            {(!laporan_terbaru || laporan_terbaru.length === 0) && (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Belum ada laporan</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
