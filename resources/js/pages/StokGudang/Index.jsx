import AppLayout from '../../layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { AlertTriangle } from 'lucide-react';

const formatRp = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);

export default function Index({ barang, kategori, filters, stokMenipisCount }) {
    return (
        <AppLayout title="Stok Gudang">
            <Head title="Stok Gudang" />
            {stokMenipisCount > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4" /> {stokMenipisCount} item stok menipis (di bawah minimum)
                </div>
            )}
            <SearchFilter route="/stok-gudang" filters={filters} placeholder="Cari kode atau nama barang...">
                <select value={filters.kategori || ''} onChange={(e) => router.get('/stok-gudang', { ...filters, kategori: e.target.value || undefined }, { preserveState: true, replace: true })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Semua Kategori</option>
                    {kategori.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
                <button onClick={() => router.get('/stok-gudang', { ...filters, stok_menipis: filters.stok_menipis ? undefined : 1 }, { preserveState: true, replace: true })} className={`px-3 py-2 rounded-lg text-sm border ${filters.stok_menipis ? 'bg-red-50 border-red-300 text-red-700' : 'border-gray-300 text-gray-600'}`}>
                    Stok Menipis
                </button>
            </SearchFilter>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50"><tr>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Kode</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Barang</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600">Satuan</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Stok</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Minimum</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Harga</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-600">Nilai Stok</th>
                        </tr></thead>
                        <tbody>
                            {barang.data.map((b) => {
                                const isLow = b.stok_minimum > 0 && parseFloat(b.stok_saat_ini) <= parseFloat(b.stok_minimum);
                                return (
                                    <tr key={b.id} className={`border-t border-gray-100 ${isLow ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                                        <td className="py-3 px-4 font-mono text-xs">{b.kode_barang}</td>
                                        <td className="py-3 px-4 font-medium">{b.nama_barang}</td>
                                        <td className="py-3 px-4">{b.kategori?.nama}</td>
                                        <td className="py-3 px-4">{b.satuan}</td>
                                        <td className={`py-3 px-4 text-right font-medium ${isLow ? 'text-red-600' : ''}`}>{b.stok_saat_ini}</td>
                                        <td className="py-3 px-4 text-right text-gray-500">{b.stok_minimum}</td>
                                        <td className="py-3 px-4 text-right">{formatRp(b.harga_satuan)}</td>
                                        <td className="py-3 px-4 text-right font-medium">{formatRp(b.stok_saat_ini * b.harga_satuan)}</td>
                                    </tr>
                                );
                            })}
                            {barang.data.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Belum ada data barang</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={barang.links} />
        </AppLayout>
    );
}
