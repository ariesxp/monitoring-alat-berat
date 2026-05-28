import AppLayout from '../../layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

const JABATAN_OPTIONS = [
    'Direksi',
    'Staff HO',
    'Staff Site',
    'Operator Excavator',
    'Operator Dozer',
    'Operator Tractor',
    'Driver',
    'Mandor',
    'Mekanik',
    'Admin',
    'Helper',
];

const DEPARTEMEN_OPTIONS = ['Head Office', 'Operasional'];

export default function Form({ operator, golongans = [] }) {
    const isEdit = !!operator;
    const { data, setData, post, put, processing, errors } = useForm({
        nama: operator?.nama || '',
        nik: operator?.nik || '',
        jenis_kelamin: operator?.jenis_kelamin || '',
        tempat_lahir: operator?.tempat_lahir || '',
        tanggal_lahir: operator?.tanggal_lahir?.split('T')[0] || '',
        no_hp: operator?.no_hp || '',
        alamat: operator?.alamat || '',
        jabatan: operator?.jabatan || '',
        departemen: operator?.departemen || '',
        golongan_id: operator?.golongan_id || '',
        gaji_pokok: operator?.gaji_pokok || '',
        tunjangan: operator?.tunjangan || '0',
        tanggal_masuk: operator?.tanggal_masuk?.split('T')[0] || '',
        status: operator?.status || 'aktif',
        status_perkawinan: operator?.status_perkawinan || '',
        pendidikan: operator?.pendidikan || '',
    });

    const formatRp = (v) => new Intl.NumberFormat('id-ID').format(v);

    const handleGolonganChange = (golonganId) => {
        setData((prev) => {
            const golongan = golongans.find((g) => g.id === Number(golonganId));
            return {
                ...prev,
                golongan_id: golonganId,
                gaji_pokok: golongan ? golongan.gaji_golongan : prev.gaji_pokok,
            };
        });
    };

    const selectedGolongan = golongans.find((g) => g.id === Number(data.golongan_id));

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(`/operator/${operator.id}`) : post('/operator');
    };

    return (
        <AppLayout title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}>
            <Head title={isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'} />
            <div className="max-w-4xl">
                <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                    {/* Kode Karyawan (read-only on edit) */}
                    {isEdit && operator?.kode_karyawan && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Karyawan</label>
                            <input type="text" value={operator.kode_karyawan} disabled className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                        </div>
                    )}

                    {/* Data Pribadi */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Data Pribadi</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                                <input type="text" value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. KTP <span className="text-red-500">*</span></label>
                                <input type="text" value={data.nik} onChange={(e) => setData('nik', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                <select value={data.jenis_kelamin} onChange={(e) => setData('jenis_kelamin', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih --</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                                {errors.jenis_kelamin && <p className="text-red-500 text-xs mt-1">{errors.jenis_kelamin}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                                <input type="text" value={data.tempat_lahir} onChange={(e) => setData('tempat_lahir', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.tempat_lahir && <p className="text-red-500 text-xs mt-1">{errors.tempat_lahir}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                                <input type="date" value={data.tanggal_lahir} onChange={(e) => setData('tanggal_lahir', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.tanggal_lahir && <p className="text-red-500 text-xs mt-1">{errors.tanggal_lahir}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                                <input type="text" value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.no_hp && <p className="text-red-500 text-xs mt-1">{errors.no_hp}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Perkawinan</label>
                                <select value={data.status_perkawinan} onChange={(e) => setData('status_perkawinan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih --</option>
                                    <option value="Belum Kawin">Belum Kawin</option>
                                    <option value="Kawin">Kawin</option>
                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                    <option value="Cerai Mati">Cerai Mati</option>
                                </select>
                                {errors.status_perkawinan && <p className="text-red-500 text-xs mt-1">{errors.status_perkawinan}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pendidikan</label>
                                <select value={data.pendidikan} onChange={(e) => setData('pendidikan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih --</option>
                                    <option value="SD">SD</option>
                                    <option value="SMP">SMP</option>
                                    <option value="SMA/SMK">SMA/SMK</option>
                                    <option value="D3">D3</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                </select>
                                {errors.pendidikan && <p className="text-red-500 text-xs mt-1">{errors.pendidikan}</p>}
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                            <textarea value={data.alamat} onChange={(e) => setData('alamat', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {errors.alamat && <p className="text-red-500 text-xs mt-1">{errors.alamat}</p>}
                        </div>
                    </div>

                    {/* Data Kepegawaian */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Data Kepegawaian</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan <span className="text-red-500">*</span></label>
                                <select value={data.jabatan} onChange={(e) => setData('jabatan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih Jabatan --</option>
                                    {JABATAN_OPTIONS.map((j) => (
                                        <option key={j} value={j}>{j}</option>
                                    ))}
                                </select>
                                {errors.jabatan && <p className="text-red-500 text-xs mt-1">{errors.jabatan}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Golongan</label>
                                <select value={data.golongan_id} onChange={(e) => handleGolonganChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih Golongan --</option>
                                    {golongans.map((g) => (
                                        <option key={g.id} value={g.id}>{g.kode_golongan} - {g.nama_golongan}</option>
                                    ))}
                                </select>
                                {errors.golongan_id && <p className="text-red-500 text-xs mt-1">{errors.golongan_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departemen</label>
                                <select value={data.departemen} onChange={(e) => setData('departemen', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="">-- Pilih Departemen --</option>
                                    {DEPARTEMEN_OPTIONS.map((d) => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                {errors.departemen && <p className="text-red-500 text-xs mt-1">{errors.departemen}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Masuk <span className="text-red-500">*</span></label>
                                <input type="date" value={data.tanggal_masuk} onChange={(e) => setData('tanggal_masuk', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.tanggal_masuk && <p className="text-red-500 text-xs mt-1">{errors.tanggal_masuk}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok <span className="text-red-500">*</span></label>
                                <input type="number" value={data.gaji_pokok} onChange={(e) => setData('gaji_pokok', e.target.value)} readOnly={!!data.golongan_id} className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${data.golongan_id ? 'bg-gray-50 text-gray-500' : ''}`} />
                                {selectedGolongan && (
                                    <p className="text-xs text-blue-600 mt-1">Sesuai golongan {selectedGolongan.nama_golongan}: Rp {formatRp(selectedGolongan.gaji_golongan)}</p>
                                )}
                                {errors.gaji_pokok && <p className="text-red-500 text-xs mt-1">{errors.gaji_pokok}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tunjangan</label>
                                <input type="number" value={data.tunjangan} onChange={(e) => setData('tunjangan', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                                {errors.tunjangan && <p className="text-red-500 text-xs mt-1">{errors.tunjangan}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="aktif">Aktif</option>
                                    <option value="tidak_aktif">Tidak Aktif</option>
                                    <option value="cuti">Cuti</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <Link href="/operator" className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
