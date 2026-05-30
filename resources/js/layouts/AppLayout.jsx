import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    LayoutDashboard, Truck, Users, Building2, FileText, ClipboardList,
    CalendarDays, PackagePlus, PackageMinus, Warehouse, Wallet, BarChart3,
    Menu, X, LogOut, ChevronDown, Bell, Layers, BookOpen, Receipt,
    FolderTree, ListTree
} from 'lucide-react';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor', 'operator'] },
    { type: 'separator', label: 'Manajemen', roles: ['admin'] },
    { label: 'Alat Berat', href: '/alat-berat', icon: Truck, roles: ['admin'] },
    { label: 'Operator / Karyawan', href: '/operator', icon: Users, roles: ['admin'] },
    { label: 'Client', href: '/client', icon: FileText, roles: ['admin'] },
    { label: 'Golongan', href: '/golongan', icon: Layers, roles: ['admin'] },
    { type: 'separator', label: 'Operasional', roles: ['admin', 'supervisor', 'operator'] },
    { label: 'Kontrak Kerja', href: '/kontrak-kerja', icon: FileText, roles: ['admin', 'supervisor'] },
    { label: 'SPK', href: '/spk', icon: ClipboardList, roles: ['admin', 'supervisor'] },
    { label: 'Laporan Harian', href: '/laporan-harian', icon: CalendarDays, roles: ['admin', 'supervisor', 'operator'] },
    { type: 'separator', label: 'Gudang', roles: ['admin', 'supervisor', 'operator'] },
    { label: 'Penerimaan Gudang', href: '/penerimaan-gudang', icon: PackagePlus, roles: ['admin', 'supervisor', 'operator'] },
    { label: 'Pengeluaran Gudang', href: '/pengeluaran-gudang', icon: PackageMinus, roles: ['admin', 'supervisor'] },
    { label: 'Stok Gudang', href: '/stok-gudang', icon: Warehouse, roles: ['admin', 'supervisor', 'operator'] },
    { type: 'separator', label: 'Keuangan', roles: ['admin'] },
    { label: 'Absensi', href: '/absensi', icon: CalendarDays, roles: ['admin'] },
    { label: 'Gaji Karyawan', href: '/gaji', icon: Wallet, roles: ['admin'] },
    { type: 'separator', label: 'Finance', roles: ['admin'] },
    { label: 'Main Account', href: '/main-account', icon: FolderTree, roles: ['admin'] },
    { label: 'Financial Statement', href: '/financial-statement-type', icon: ListTree, roles: ['admin'] },
    { label: 'Chart of Account', href: '/account', icon: BookOpen, roles: ['admin'] },
    { label: 'Petty Cash', href: '/petty-cash', icon: Receipt, roles: ['admin'] },
    { type: 'separator', label: 'Laporan', roles: ['admin', 'supervisor'] },
    { label: 'Statistik', href: '/statistik', icon: BarChart3, roles: ['admin', 'supervisor'] },
];

export default function AppLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = auth.user;
    const currentPath = window.location.pathname;

    const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img src="/logo-aob.png" alt="Logo AOB" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-bold text-gray-800">AOB</span>
                    </Link>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {filteredMenu.map((item, i) => {
                        if (item.type === 'separator') {
                            return <div key={i} className="pt-4 pb-1 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</div>;
                        }
                        const Icon = item.icon;
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 lg:hidden">
                            <Menu className="w-5 h-5" />
                        </button>
                        {title && <h1 className="text-lg font-semibold text-gray-800">{title}</h1>}
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-700">{user.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                        </div>
                        <button
                            onClick={() => router.post('/logout')}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Flash messages */}
                {flash?.success && (
                    <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
