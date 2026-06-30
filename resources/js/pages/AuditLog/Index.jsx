import AppLayout from '../../layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import Pagination from '../../components/Pagination';
import SearchFilter from '../../components/SearchFilter';
import { Eye } from 'lucide-react';

const eventBadge = {
    created: 'bg-green-50 text-green-700',
    updated: 'bg-yellow-50 text-yellow-700',
    deleted: 'bg-red-50 text-red-700',
    login: 'bg-blue-50 text-blue-700',
    logout: 'bg-gray-100 text-gray-600',
};

export default function Index({ logs, filters, events }) {
    const setEvent = (event) => {
        router.get('/audit-log', { ...filters, event: event || undefined, page: undefined }, {
            preserveState: true, preserveScroll: true, replace: true,
        });
    };

    return (
        <AppLayout title="Audit Log">
            <Head title="Audit Log" />
            <SearchFilter route="/audit-log" filters={filters} placeholder="Cari user, deskripsi, atau modul...">
                <select
                    value={filters.event || ''}
                    onChange={(e) => setEvent(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white capitalize"
                >
                    <option value="">Semua Event</option>
                    {events.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
            </SearchFilter>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Waktu</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Event</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Deskripsi</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Modul</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">IP</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.data.map((l) => (
                                <tr key={l.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{l.created_at}</td>
                                    <td className="py-3 px-4 font-medium">{l.user_name}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${eventBadge[l.event] || 'bg-gray-100 text-gray-600'}`}>{l.event}</span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{l.description}</td>
                                    <td className="py-3 px-4 text-gray-600">{l.model || '-'}</td>
                                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{l.ip_address || '-'}</td>
                                    <td className="py-3 px-4">
                                        <Link href={`/audit-log/${l.id}`} className="p-1.5 rounded hover:bg-blue-50 text-blue-600 inline-flex"><Eye className="w-4 h-4" /></Link>
                                    </td>
                                </tr>
                            ))}
                            {logs.data.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Belum ada catatan aktivitas</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
            <Pagination links={logs.links} />
        </AppLayout>
    );
}
