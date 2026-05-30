import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, Package } from 'lucide-react';

export default function Show({ barang }) {
    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    return (
        <AppLayout title="Detail Barang">
            <Head title="Detail Barang" />
            <div className="space-y-4">
                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Link href="/barang" className="p-2 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1" />
                    <Link href={`/barang/${barang.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600">
                        <Pencil className="w-4 h-4" /> Edit
                    </Link>
                    <button
                        onClick={() => confirm('Hapus barang ini?') && router.delete(`/barang/${barang.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                    >
                        <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Image */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-center">
                        {barang.gambar ? (
                            <img src={`/storage/${barang.gambar}`} alt={barang.nama_barang} className="w-full max-w-xs rounded-xl object-cover" />
                        ) : (
                            <div className="w-full h-48 bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                                <Package className="w-12 h-12 mb-2" />
                                <span className="text-sm">Tidak ada gambar</span>
                            </div>
                        )}
                    </div>

                    {/* Detail Info */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Informasi Barang</h2>
                        </div>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t border-gray-100 first:border-t-0">
                                    <td className="py-3 px-4 font-medium text-gray-500 w-40">Kode Barang</td>
                                    <td className="py-3 px-4 font-mono font-semibold">{barang.kode_barang}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Barcode</td>
                                    <td className="py-3 px-4 font-mono">{barang.barcode || '-'}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Nama Barang</td>
                                    <td className="py-3 px-4 font-medium">{barang.nama_barang}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Kategori</td>
                                    <td className="py-3 px-4">
                                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {barang.kategori?.nama || '-'}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Satuan</td>
                                    <td className="py-3 px-4">{barang.satuan}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Harga Satuan</td>
                                    <td className="py-3 px-4 font-medium text-green-600">{formatRupiah(barang.harga_satuan)}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Stok Saat Ini</td>
                                    <td className="py-3 px-4">
                                        <span className={`font-semibold text-lg ${parseFloat(barang.stok_saat_ini) <= parseFloat(barang.stok_minimum) ? 'text-red-600' : 'text-blue-600'}`}>
                                            {parseFloat(barang.stok_saat_ini).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-gray-500 ml-1">{barang.satuan}</span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Stok Minimum</td>
                                    <td className="py-3 px-4">{parseFloat(barang.stok_minimum).toLocaleString('id-ID')} {barang.satuan}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Lokasi Gudang</td>
                                    <td className="py-3 px-4">{barang.lokasi_gudang || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
