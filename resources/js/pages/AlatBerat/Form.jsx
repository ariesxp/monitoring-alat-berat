import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

function Field({ label, name, type = 'text', required, children, data, setData, errors }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            {children || (
                <input type={type} value={data[name]} onChange={(e) => setData(name, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
        </div>
    );
}

export default function Form({ alatBerat }) {
    const isEdit = !!alatBerat;
    const { data, setData, post, put, processing, errors } = useForm({
        kode_alat: alatBerat?.kode_alat || '',
        nama_alat: alatBerat?.nama_alat || '',
        jenis: alatBerat?.jenis || '',
        merk: alatBerat?.merk || '',
        tahun: alatBerat?.tahun || '',
        nomor_seri: alatBerat?.nomor_seri || '',
        nomor_polisi: alatBerat?.nomor_polisi || '',
        no_mesin: alatBerat?.no_mesin || '',
        no_chassis: alatBerat?.no_chassis || '',
        dealer: alatBerat?.dealer || '',
        harga: alatBerat?.harga || '',
        invoice: alatBerat?.invoice || '',
        hm_awal: alatBerat?.hm_awal || '',
        status: alatBerat?.status || 'tersedia',
        lokasi_terakhir: alatBerat?.lokasi_terakhir || '',
        catatan: alatBerat?.catatan || '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(`/alat-berat/${alatBerat.id}`);
        } else {
            post('/alat-berat');
        }
    };

    return (
        <AppLayout title={isEdit ? 'Edit Alat Berat' : 'Tambah Alat Berat'}>
            <Head title={isEdit ? 'Edit Alat Berat' : 'Tambah Alat Berat'} />

            <div className="max-w-3xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field data={data} setData={setData} errors={errors} label="Kode Alat" name="kode_alat" required />
                        <Field data={data} setData={setData} errors={errors} label="Nama Alat" name="nama_alat" required />
                        <Field data={data} setData={setData} errors={errors} label="Jenis" name="jenis" required />
                        <Field data={data} setData={setData} errors={errors} label="Merk" name="merk" required />
                        <Field data={data} setData={setData} errors={errors} label="Tahun" name="tahun" type="number" />
                        <Field data={data} setData={setData} errors={errors} label="Nomor Seri" name="nomor_seri" />
                        <Field data={data} setData={setData} errors={errors} label="Nomor Polisi" name="nomor_polisi" />
                        <Field data={data} setData={setData} errors={errors} label="No. Mesin" name="no_mesin" />
                        <Field data={data} setData={setData} errors={errors} label="No. Chassis" name="no_chassis" />
                        <Field data={data} setData={setData} errors={errors} label="Dealer" name="dealer" />
                        <Field data={data} setData={setData} errors={errors} label="Harga" name="harga" type="number" />
                        <Field data={data} setData={setData} errors={errors} label="Invoice" name="invoice" />
                        <Field data={data} setData={setData} errors={errors} label="HM Awal" name="hm_awal" type="number" />
                        <Field data={data} setData={setData} errors={errors} label="Status" name="status" required>
                            <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                <option value="tersedia">Tersedia</option>
                                <option value="beroperasi">Beroperasi</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="rusak">Rusak</option>
                            </select>
                        </Field>
                    </div>
                    <Field data={data} setData={setData} errors={errors} label="Lokasi Terakhir" name="lokasi_terakhir" />
                    <Field data={data} setData={setData} errors={errors} label="Catatan" name="catatan">
                        <textarea value={data.catatan} onChange={(e) => setData('catatan', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link href="/alat-berat" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
