import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Smartphone, MessageSquare, Globe, MapPin, Clock, Gauge, Package, FileText } from 'lucide-react';

export default function Show({ laporan }) {
    const Info = ({ label, value }) => (
        <div>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-sm font-medium text-gray-800 mt-0.5">{value ?? '-'}</dd>
        </div>
    );

    const Section = ({ icon: Icon, title, children }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
                <Icon className="w-4 h-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            </div>
            {children}
        </div>
    );

    const num = (v) =>
        v == null ? null : Number(v).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Satuan meter: KM bila km terisi (unit KM), selain itu HM.
    const isKm = laporan.km_awal != null;
    const meterLabel = isKm ? 'Kilometer (KM)' : 'Hour Meter (HM)';
    const meterAwal = isKm ? laporan.km_awal : laporan.hm_awal;
    const meterAkhir = isKm ? laporan.km_akhir : laporan.hm_akhir;
    const meterTotal =
        meterAwal != null && meterAkhir != null ? Number(meterAkhir) - Number(meterAwal) : null;

    const sumber = laporan.sumber_input;
    const sumberBadge = {
        android: { label: 'Android', cls: 'bg-orange-100 text-orange-700', Icon: Smartphone },
        whatsapp: { label: 'WhatsApp', cls: 'bg-green-100 text-green-700', Icon: MessageSquare },
        web: { label: 'Web', cls: 'bg-gray-100 text-gray-600', Icon: Globe },
    }[sumber] ?? { label: sumber, cls: 'bg-gray-100 text-gray-600', Icon: Globe };
    const SumberIcon = sumberBadge.Icon;

    const kondisiCls =
        laporan.kondisi_alat === 'baik'
            ? 'bg-green-100 text-green-700'
            : laporan.kondisi_alat === 'rusak'
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700';

    const fotoUrl = laporan.foto ? (laporan.foto.startsWith('http') ? laporan.foto : `/storage/${laporan.foto}`) : null;

    return (
        <AppLayout title="Detail Laporan Harian">
            <Head title="Detail Laporan" />

            <div className="flex items-center justify-between mb-4">
                <Link href="/laporan-harian" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sumberBadge.cls}`}>
                    <SumberIcon className="w-3.5 h-3.5" /> Sumber: {sumberBadge.label}
                </span>
            </div>

            {sumber === 'android' && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3">
                    <Smartphone className="w-4 h-4 text-orange-600 mt-0.5" />
                    <p className="text-sm text-orange-800">
                        Laporan ini dibuat otomatis dari <b>Aplikasi Monitoring Android</b> (tanpa SPK).
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Section icon={FileText} title="Informasi Umum">
                    <dl className="grid grid-cols-2 gap-4">
                        <Info label="Tanggal" value={new Date(laporan.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} />
                        <Info label="SPK" value={laporan.spk?.nomor_spk} />
                        <Info label="Operator" value={laporan.operator?.nama} />
                        <Info label="Alat Berat" value={laporan.alat_berat?.nama_alat} />
                        <div>
                            <dt className="text-xs text-gray-500">Kondisi Alat</dt>
                            <dd className="mt-0.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${kondisiCls}`}>{laporan.kondisi_alat}</span></dd>
                        </div>
                        <Info label="BBM" value={laporan.bbm_liter != null ? `${num(laporan.bbm_liter)} liter` : null} />
                    </dl>
                </Section>

                <Section icon={Clock} title="Waktu Kerja">
                    <dl className="grid grid-cols-2 gap-4">
                        <Info label="Jam Mulai" value={laporan.jam_mulai?.substring(0, 5)} />
                        <Info label="Jam Selesai" value={laporan.jam_selesai?.substring(0, 5)} />
                        <Info label="Total Jam Kerja" value={laporan.jam_kerja != null ? `${laporan.jam_kerja} jam` : null} />
                    </dl>
                </Section>

                <Section icon={Gauge} title={meterLabel}>
                    <dl className="grid grid-cols-3 gap-4">
                        <Info label="Awal" value={num(meterAwal)} />
                        <Info label="Akhir" value={num(meterAkhir)} />
                        <div>
                            <dt className="text-xs text-gray-500">Total</dt>
                            <dd className="text-sm font-semibold text-green-700 mt-0.5">{num(meterTotal) ?? '-'}</dd>
                        </div>
                    </dl>
                </Section>

                <Section icon={Package} title="Pekerjaan & Hasil">
                    <dl className="grid grid-cols-2 gap-4">
                        <Info label="Jenis Pekerjaan" value={laporan.jenis_pekerjaan} />
                        <div>
                            <dt className="text-xs text-gray-500">Lokasi / Blok</dt>
                            <dd className="text-sm font-medium text-gray-800 mt-0.5 flex items-center gap-1">
                                {laporan.lokasi_kerja ? (<><MapPin className="w-3.5 h-3.5 text-gray-400" /> {laporan.lokasi_kerja}</>) : '-'}
                            </dd>
                        </div>
                        <Info
                            label="Hasil Muatan / Volume"
                            value={laporan.volume_pekerjaan != null ? `${num(laporan.volume_pekerjaan)} ${laporan.satuan_volume ?? ''}`.trim() : null}
                        />
                    </dl>
                </Section>
            </div>

            {laporan.catatan && (
                <div className="mt-4">
                    <Section icon={FileText} title="Catatan">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{laporan.catatan}</p>
                    </Section>
                </div>
            )}

            {fotoUrl && (
                <div className="bg-white rounded-xl border border-gray-200 p-5 mt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Foto Bukti</h3>
                    <img src={fotoUrl} alt="Foto laporan" className="max-h-80 rounded-lg border border-gray-200" />
                </div>
            )}
        </AppLayout>
    );
}
