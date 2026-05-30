import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Plus, Trash2, Upload, X, FileText } from 'lucide-react';
import { useState, useRef } from 'react';

const emptyDetail = { jenis_barang: '', barcode: '', kode_barang: '', nama_barang: '', satuan: '', quantity: '' };

export default function Form({ purchaseRequest, kategoriBarang, barangList }) {
    const isEdit = !!purchaseRequest;
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState(purchaseRequest?.lampiran ? purchaseRequest.lampiran.split('/').pop() : '');

    const initialDetails = isEdit && purchaseRequest.details?.length
        ? purchaseRequest.details.map(d => ({
            jenis_barang: d.jenis_barang || '',
            barcode: d.barcode || '',
            kode_barang: d.kode_barang || '',
            nama_barang: d.nama_barang || '',
            satuan: d.satuan || '',
            quantity: d.quantity || '',
        }))
        : [{ ...emptyDetail }];

    const { data, setData, post, processing, errors } = useForm({
        domisili: purchaseRequest?.domisili || 'HO',
        jenis_pr: purchaseRequest?.jenis_pr || 'Inventory',
        kode_site: purchaseRequest?.kode_site || '',
        nama_site: purchaseRequest?.nama_site || '',
        posting_date: purchaseRequest?.posting_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        lokasi_gudang: purchaseRequest?.lokasi_gudang || '',
        keterangan: purchaseRequest?.keterangan || '',
        lampiran: null,
        details: initialDetails,
        _method: isEdit ? 'PUT' : undefined,
    });

    const filteredBarang = (jenisBarang) => {
        if (!jenisBarang) return barangList;
        const kategori = kategoriBarang.find(k => k.nama === jenisBarang);
        if (!kategori) return barangList;
        return barangList.filter(b => b.kategori_barang_id === kategori.id);
    };

    const addDetail = () => setData('details', [...data.details, { ...emptyDetail }]);

    const removeDetail = (index) => {
        if (data.details.length <= 1) return;
        setData('details', data.details.filter((_, i) => i !== index));
    };

    const updateDetail = (index, field, value) => {
        const updated = data.details.map((d, i) => {
            if (i !== index) return d;
            const newDetail = { ...d, [field]: value };

            if (field === 'jenis_barang') {
                newDetail.barcode = '';
                newDetail.kode_barang = '';
                newDetail.nama_barang = '';
                newDetail.satuan = '';
            }

            if (field === 'barcode' && value) {
                const brg = barangList.find(b => b.kode_barang === value);
                if (brg) {
                    newDetail.kode_barang = brg.kode_barang;
                    newDetail.nama_barang = brg.nama_barang;
                    newDetail.satuan = brg.satuan;
                }
            }

            if (field === 'kode_barang' && value) {
                const brg = barangList.find(b => b.id == value);
                if (brg) {
                    newDetail.kode_barang = brg.kode_barang;
                    newDetail.nama_barang = brg.nama_barang;
                    newDetail.satuan = brg.satuan;
                    newDetail.barcode = brg.kode_barang;
                }
            }

            return newDetail;
        });
        setData('details', updated);
    };

    const handleFile = (file) => {
        if (file) {
            setData('lampiran', file);
            setFileName(file.name);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeFile = () => {
        setData('lampiran', null);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const submit = (e) => {
        e.preventDefault();
        const url = isEdit ? `/purchase-request/${purchaseRequest.id}` : '/purchase-request';
        post(url, { forceFormData: true });
    };

    return (
        <AppLayout title={isEdit ? 'Edit Purchase Request' : 'Buat Purchase Request'}>
            <Head title={isEdit ? 'Edit Purchase Request' : 'Buat Purchase Request'} />
            <form onSubmit={submit} className="space-y-4">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Header Purchase Request</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domisili <span className="text-red-500">*</span></label>
                            <select value={data.domisili} onChange={(e) => setData('domisili', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="HO">HO (Head Office)</option>
                                <option value="Site">Site</option>
                            </select>
                            {errors.domisili && <p className="text-red-500 text-xs mt-1">{errors.domisili}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Purchase Request <span className="text-red-500">*</span></label>
                            <select value={data.jenis_pr} onChange={(e) => setData('jenis_pr', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                <option value="Inventory">Inventory</option>
                                <option value="Asset">Asset</option>
                            </select>
                            {errors.jenis_pr && <p className="text-red-500 text-xs mt-1">{errors.jenis_pr}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Posting Date <span className="text-red-500">*</span></label>
                            <input type="date" value={data.posting_date} onChange={(e) => setData('posting_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {errors.posting_date && <p className="text-red-500 text-xs mt-1">{errors.posting_date}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Site <span className="text-red-500">*</span></label>
                            <input type="text" value={data.kode_site} onChange={(e) => setData('kode_site', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Contoh: SITE-001" />
                            {errors.kode_site && <p className="text-red-500 text-xs mt-1">{errors.kode_site}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Site <span className="text-red-500">*</span></label>
                            <input type="text" value={data.nama_site} onChange={(e) => setData('nama_site', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Nama lokasi site" />
                            {errors.nama_site && <p className="text-red-500 text-xs mt-1">{errors.nama_site}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Gudang <span className="text-red-500">*</span></label>
                            <input type="text" value={data.lokasi_gudang} onChange={(e) => setData('lokasi_gudang', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Lokasi gudang" />
                            {errors.lokasi_gudang && <p className="text-red-500 text-xs mt-1">{errors.lokasi_gudang}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                        <textarea value={data.keterangan} onChange={(e) => setData('keterangan', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Catatan tambahan (opsional)" />
                        {errors.keterangan && <p className="text-red-500 text-xs mt-1">{errors.keterangan}</p>}
                    </div>

                    {/* Lampiran Drag & Drop */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
                        {fileName ? (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <span className="text-sm text-blue-700 truncate flex-1">{fileName}</span>
                                <button type="button" onClick={removeFile} className="p-1 rounded hover:bg-blue-100 text-blue-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={() => setDragActive(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">
                                    <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop file di sini
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Maks. 10MB</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => handleFile(e.target.files?.[0])}
                                />
                            </div>
                        )}
                        {errors.lampiran && <p className="text-red-500 text-xs mt-1">{errors.lampiran}</p>}
                    </div>
                </div>

                {/* Detail Lines */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Detail Barang</h2>
                        <button type="button" onClick={addDetail} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700">
                            <Plus className="w-3.5 h-3.5" /> Tambah Baris
                        </button>
                    </div>
                    {errors.details && <p className="text-red-500 text-xs">{errors.details}</p>}

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-8">#</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[150px]">Jenis Barang <span className="text-red-500">*</span></th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[160px]">Barcode</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 min-w-[200px]">Barang <span className="text-red-500">*</span></th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-28">Kode</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-600 w-24">Satuan</th>
                                    <th className="text-right py-2 px-3 font-medium text-gray-600 w-28">Qty <span className="text-red-500">*</span></th>
                                    <th className="py-2 px-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.details.map((detail, idx) => {
                                    const filtered = filteredBarang(detail.jenis_barang);
                                    return (
                                        <tr key={idx} className="border-t border-gray-100">
                                            <td className="py-2 px-3 text-gray-400 text-xs">{idx + 1}</td>
                                            <td className="py-2 px-3">
                                                <select value={detail.jenis_barang} onChange={(e) => updateDetail(idx, 'jenis_barang', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Pilih Jenis</option>
                                                    {kategoriBarang.map((k) => (
                                                        <option key={k.id} value={k.nama}>{k.nama}</option>
                                                    ))}
                                                </select>
                                                {errors[`details.${idx}.jenis_barang`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.jenis_barang`]}</p>}
                                            </td>
                                            <td className="py-2 px-3">
                                                <select value={detail.barcode} onChange={(e) => updateDetail(idx, 'barcode', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Pilih Barcode</option>
                                                    {filtered.map((b) => (
                                                        <option key={b.id} value={b.kode_barang}>{b.kode_barang}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-2 px-3">
                                                <select value={detail.kode_barang ? barangList.find(b => b.kode_barang === detail.kode_barang)?.id || '' : ''} onChange={(e) => updateDetail(idx, 'kode_barang', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Pilih Barang</option>
                                                    {filtered.map((b) => (
                                                        <option key={b.id} value={b.id}>{b.kode_barang} - {b.nama_barang}</option>
                                                    ))}
                                                </select>
                                                {errors[`details.${idx}.kode_barang`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.kode_barang`]}</p>}
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="text" value={detail.kode_barang} readOnly className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-gray-600" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="text" value={detail.satuan} readOnly className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-gray-600" />
                                            </td>
                                            <td className="py-2 px-3">
                                                <input type="number" value={detail.quantity} onChange={(e) => updateDetail(idx, 'quantity', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500" min="0.01" step="0.01" placeholder="0" />
                                                {errors[`details.${idx}.quantity`] && <p className="text-red-500 text-xs mt-0.5">{errors[`details.${idx}.quantity`]}</p>}
                                            </td>
                                            <td className="py-2 px-3">
                                                {data.details.length > 1 && (
                                                    <button type="button" onClick={() => removeDetail(idx)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {processing ? 'Menyimpan...' : 'Simpan & Kirim'}
                    </button>
                    <Link href="/purchase-request" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                </div>
            </form>
        </AppLayout>
    );
}
