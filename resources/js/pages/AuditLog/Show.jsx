import AppLayout from '../../layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

function ValueTable({ title, values }) {
    if (!values || Object.keys(values).length === 0) {
        return (
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
                <p className="text-sm text-gray-400">-</p>
            </div>
        );
    }
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <tbody>
                        {Object.entries(values).map(([key, val]) => (
                            <tr key={key} className="border-b border-gray-100 last:border-0">
                                <td className="py-2 px-3 font-mono text-xs text-gray-500 bg-gray-50 w-1/3 align-top">{key}</td>
                                <td className="py-2 px-3 text-gray-700 break-all">{val === null ? '—' : String(typeof val === 'object' ? JSON.stringify(val) : val)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Show({ log }) {
    return (
        <AppLayout title="Detail Audit Log">
            <Head title="Detail Audit Log" />
            <div className="max-w-3xl space-y-4">
                <Link href="/audit-log" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4" /> Kembali
                </Link>

                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                        <div><div className="text-gray-400 text-xs">Waktu</div><div className="font-medium">{log.created_at}</div></div>
                        <div><div className="text-gray-400 text-xs">User</div><div className="font-medium">{log.user_name}</div></div>
                        <div><div className="text-gray-400 text-xs">Event</div><div className="font-medium capitalize">{log.event}</div></div>
                        <div><div className="text-gray-400 text-xs">Modul</div><div className="font-medium">{log.model || '-'}</div></div>
                        <div><div className="text-gray-400 text-xs">ID Data</div><div className="font-medium">{log.auditable_id || '-'}</div></div>
                        <div><div className="text-gray-400 text-xs">IP Address</div><div className="font-mono text-xs">{log.ip_address || '-'}</div></div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">Deskripsi</div>
                        <div className="text-sm">{log.description}</div>
                    </div>
                    <div>
                        <div className="text-gray-400 text-xs">User Agent</div>
                        <div className="text-xs text-gray-600 break-all">{log.user_agent || '-'}</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ValueTable title="Nilai Lama" values={log.old_values} />
                    <ValueTable title="Nilai Baru" values={log.new_values} />
                </div>
            </div>
        </AppLayout>
    );
}
