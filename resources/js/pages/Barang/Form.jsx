import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Form({ barang, kategoriList }) {
    const isEdit = !!barang;
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(barang?.gambar ? `/storage/${barang.gambar}` : null);

    const { data, setData, post, processing, errors } = useForm({
        kategori_barang_id: barang?.kategori_barang_id || '',
        kode_barang: barang?.kode_barang || '',
        barcode: barang?.barcode || '',
        nama_barang: barang?.nama_barang || '',
        satuan: barang?.satuan || '',
        stok_minimum: barang?.stok_minimum || '0',
        harga_satuan: barang?.harga_satuan || '0',
        lokasi_gudang: barang?.lokasi_gudang || '',
        gambar: null,
        hapus_gambar: false,
        _method: isEdit ? 'PUT' : undefined,
    });

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            setData('gambar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeImage = () => {
        setData(prev => ({ ...prev, gambar: null, hapus_gambar: true }));
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        const url = isEdit ? `/barang/${barang.id}` : '/barang';
        post(url, { forceFormData: true });
    };

    return (
        <AppLayout title={isEdit ? 'Edit Barang' : 'Tambah Barang'}>
            <Head title={isEdit ? 'Edit Barang' : 'Tambah Barang'} />
            <form onSubmit={submit} className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Informasi Barang</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select value={data.kategori_barang_id} onChange={(e) => setData('kategori_barang_id', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="">Pilih Kategori</option>
                                {kategoriList.map((k) => (
                                    <option key={k.id} value={k.id}>{k.nama}</option>
                                ))}
                            </select>
                            {errors.kategori_barang_id && <p className="text-red-500 text-xs mt-1">{errors.kategori_barang_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Barang <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_barang} onChange={(e) => setData('kode_barang', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="BRG-001" />
                            {errors.kode_barang && <p className="text-red-500 text-xs mt-1">{errors.kode_barang}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                            <input type="text" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Barcode barang" />
                            {errors.barcode && <p className="text-red-500 text-xs mt-1">{errors.barcode}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_barang} onChange={(e) => setData('nama_barang', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Nama barang" />
                            {errors.nama_barang && <p className="text-red-500 text-xs mt-1">{errors.nama_barang}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan <span className="text-red-500">*</span></label>
                            <input type="text" value={data.satuan} onChange={(e) => setData('satuan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="pcs, kg, liter, dll" />
                            {errors.satuan && <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum <span className="text-red-500">*</span></label>
                            <input type="number" value={data.stok_minimum} onChange={(e) => setData('stok_minimum', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" min="0" step="0.01" />
                            {errors.stok_minimum && <p className="text-red-500 text-xs mt-1">{errors.stok_minimum}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Satuan <span className="text-red-500">*</span></label>
                            <input type="number" value={data.harga_satuan} onChange={(e) => setData('harga_satuan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" min="0" step="1" />
                            {errors.harga_satuan && <p className="text-red-500 text-xs mt-1">{errors.harga_satuan}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Gudang</label>
                            <input type="text" value={data.lokasi_gudang} onChange={(e) => setData('lokasi_gudang', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Rak A1, Gudang Utama, dll" />
                            {errors.lokasi_gudang && <p className="text-red-500 text-xs mt-1">{errors.lokasi_gudang}</p>}
                        </div>
                    </div>
                </div>

                {/* Gambar Upload */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Gambar Barang</h2>
                    {preview ? (
                        <div className="relative inline-block">
                            <img src={preview} alt="Preview" className="w-48 h-48 object-cover rounded-xl border border-gray-200" />
                            <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">
                                <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop gambar di sini
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG (Maks. 5MB)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFile(e.target.files?.[0])}
                            />
                        </div>
                    )}
                    {errors.gambar && <p className="text-red-500 text-xs mt-1">{errors.gambar}</p>}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {processing ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <Link href="/barang" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
