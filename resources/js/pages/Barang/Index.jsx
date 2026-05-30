import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Plus, Eye, Pencil, Trash2, Package } from 'lucide-react';

export default function Index({ barang, filters, kategoriList }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AppLayout title="Master Barang">
            <Head title="Master Barang" />

            <div className="flex justify-between items-center mb-4">
                <div />
                <Link href="/barang/create" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                    <Plus className="w-4 h-4" /> Tambah Barang
                </Link>
            </div>

            <SearchFilter route="/barang" filters={filters} placeholder="Cari kode, barcode, nama barang, atau kategori...">
                <select
                    value={filters.kategori_barang_id || ''}
                    onChange={(e) => router.get('/barang', { ...filters, kategori_barang_id: e.target.value || undefined }, { preserveState: true, replace: true })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                >
                    <option value="">Semua Kategori</option>
                    {kategoriList.map((k) => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                </select>
            </SearchFilter>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Gambar</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kode Barang</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Barcode</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nama Barang</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Kategori</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Satuan</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Stok</th>
                                <th className="text-right py-3 px-4 font-medium text-gray-600">Harga Satuan</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barang.data.map((b) => (
                                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                        {b.gambar ? (
                                            <img src={`/storage/${b.gambar}`} alt={b.nama_barang} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Package className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-xs font-medium">{b.kode_barang}</td>
                                    <td className="py-3 px-4 font-mono text-xs">{b.barcode || '-'}</td>
                                    <td className="py-3 px-4 font-medium">{b.nama_barang}</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {b.kategori?.nama || '-'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">{b.satuan}</td>
                                    <td className="py-3 px-4 text-right">
                                        <span className={`font-medium ${parseFloat(b.stok_saat_ini) <= parseFloat(b.stok_minimum) ? 'text-red-600' : 'text-gray-800'}`}>
                                            {parseFloat(b.stok_saat_ini).toLocaleString('id-ID')}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-600">{formatRupiah(b.harga_satuan)}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Link href={`/barang/${b.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></Link>
                                            <Link href={`/barang/${b.id}/edit`} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Pencil className="w-4 h-4" /></Link>
                                            <button onClick={() => confirm('Hapus barang ini?') && router.delete(`/barang/${b.id}`)} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {barang.data.length === 0 && (
                                <tr><td colSpan={9} className="py-8 text-center text-gray-400">Belum ada data barang</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={barang.links} />
        </AppLayout>
    );
}
