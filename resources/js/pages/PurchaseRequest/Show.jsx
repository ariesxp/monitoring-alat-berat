import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil, Trash2, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import { useState } from 'react';

const statusColor = {
    Draft: 'bg-gray-100 text-gray-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
};

export default function Show({ purchaseRequest }) {
    const [showApproval, setShowApproval] = useState(false);
    const approvalForm = useForm({ status: 'Approved', approval_note: '' });

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

    const details = purchaseRequest.details || [];

    const submitApproval = (e) => {
        e.preventDefault();
        approvalForm.post(`/purchase-request/${purchaseRequest.id}/approve`, {
            onSuccess: () => setShowApproval(false),
        });
    };

    return (
        <AppLayout title="Detail Purchase Request">
            <Head title="Detail Purchase Request" />
            <div className="space-y-4">
                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Link href="/purchase-request" className="p-2 rounded-lg hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div className="flex-1" />
                    {purchaseRequest.status === 'Pending' && (
                        <button
                            onClick={() => setShowApproval(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
                        >
                            <CheckCircle className="w-4 h-4" /> Approval
                        </button>
                    )}
                    {purchaseRequest.status !== 'Approved' && (
                        <>
                            <Link href={`/purchase-request/${purchaseRequest.id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600">
                                <Pencil className="w-4 h-4" /> Edit
                            </Link>
                            <button
                                onClick={() => confirm('Hapus Purchase Request ini?') && router.delete(`/purchase-request/${purchaseRequest.id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                        </>
                    )}
                </div>

                {/* Approval Modal */}
                {showApproval && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Approval Purchase Request</h3>
                            <form onSubmit={submitApproval} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Keputusan</label>
                                    <select value={approvalForm.data.status} onChange={(e) => approvalForm.setData('status', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="Approved">Approve</option>
                                        <option value="Rejected">Reject</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                                    <textarea value={approvalForm.data.approval_note} onChange={(e) => approvalForm.setData('approval_note', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Catatan approval (opsional)" />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button type="button" onClick={() => setShowApproval(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">Batal</button>
                                    <button type="submit" disabled={approvalForm.processing} className={`px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 ${approvalForm.data.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                        {approvalForm.processing ? 'Memproses...' : approvalForm.data.status === 'Approved' ? 'Approve' : 'Reject'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Header Info */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Header Purchase Request</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[purchaseRequest.status]}`}>
                            {purchaseRequest.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t border-gray-100 first:border-t-0">
                                    <td className="py-3 px-4 font-medium text-gray-500 w-40">Nomor PR</td>
                                    <td className="py-3 px-4 font-mono font-semibold">{purchaseRequest.nomor_pr}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Domisili</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${purchaseRequest.domisili === 'HO' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {purchaseRequest.domisili}
                                        </span>
                                    </td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Jenis PR</td>
                                    <td className="py-3 px-4">{purchaseRequest.jenis_pr}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Posting Date</td>
                                    <td className="py-3 px-4">{formatDate(purchaseRequest.posting_date)}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Kode Site</td>
                                    <td className="py-3 px-4 font-mono text-xs">{purchaseRequest.kode_site}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t border-gray-100 md:first:border-t-0">
                                    <td className="py-3 px-4 font-medium text-gray-500 w-40">Nama Site</td>
                                    <td className="py-3 px-4">{purchaseRequest.nama_site}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Lokasi Gudang</td>
                                    <td className="py-3 px-4">{purchaseRequest.lokasi_gudang}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Keterangan</td>
                                    <td className="py-3 px-4">{purchaseRequest.keterangan || '-'}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Request By</td>
                                    <td className="py-3 px-4 font-medium">{purchaseRequest.requester?.name}</td>
                                </tr>
                                <tr className="border-t border-gray-100">
                                    <td className="py-3 px-4 font-medium text-gray-500">Lampiran</td>
                                    <td className="py-3 px-4">
                                        {purchaseRequest.lampiran ? (
                                            <a href={`/storage/${purchaseRequest.lampiran}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm">
                                                <FileText className="w-4 h-4" />
                                                <span>Lihat Lampiran</span>
                                                <Download className="w-3.5 h-3.5" />
                                            </a>
                                        ) : '-'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Approval Info */}
                {purchaseRequest.approved_by && (
                    <div className={`rounded-xl border overflow-hidden ${purchaseRequest.status === 'Approved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="px-4 py-3 flex items-center gap-3">
                            {purchaseRequest.status === 'Approved'
                                ? <CheckCircle className="w-5 h-5 text-green-600" />
                                : <XCircle className="w-5 h-5 text-red-600" />
                            }
                            <div>
                                <div className={`text-sm font-medium ${purchaseRequest.status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>
                                    {purchaseRequest.status === 'Approved' ? 'Diapprove' : 'Ditolak'} oleh {purchaseRequest.approver?.name}
                                </div>
                                <div className="text-xs text-gray-500">{formatDate(purchaseRequest.approved_at)}</div>
                                {purchaseRequest.approval_note && (
                                    <div className="text-sm text-gray-600 mt-1">{purchaseRequest.approval_note}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Lines */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Detail Barang ({details.length} item)</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600 w-8">#</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Jenis Barang</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Barcode</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Kode Barang</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Nama Barang</th>
                                    <th className="text-left py-2 px-4 font-medium text-gray-600">Satuan</th>
                                    <th className="text-right py-2 px-4 font-medium text-gray-600">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.map((d, idx) => (
                                    <tr key={d.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-2 px-4 text-gray-400 text-xs">{idx + 1}</td>
                                        <td className="py-2 px-4">{d.jenis_barang}</td>
                                        <td className="py-2 px-4 font-mono text-xs">{d.barcode || '-'}</td>
                                        <td className="py-2 px-4 font-mono text-xs font-medium">{d.kode_barang}</td>
                                        <td className="py-2 px-4">{d.nama_barang}</td>
                                        <td className="py-2 px-4">{d.satuan}</td>
                                        <td className="py-2 px-4 text-right font-medium">{parseFloat(d.quantity).toLocaleString('id-ID')}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 font-medium">
                                <tr className="border-t-2 border-gray-300">
                                    <td colSpan={6} className="py-3 px-4 text-right text-gray-600">Total Item</td>
                                    <td className="py-3 px-4 text-right font-semibold text-blue-600">{details.length}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
