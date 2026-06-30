import AppLayout from '../../layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { User, KeyRound } from 'lucide-react';

export default function Edit({ user }) {
    const profile = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profile.put('/profile', { preserveScroll: true });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        password.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => password.reset(),
        });
    };

    return (
        <AppLayout title="Profil Saya">
            <Head title="Profil Saya" />
            <div className="max-w-2xl space-y-6">
                {/* Informasi Profil */}
                <form onSubmit={submitProfile} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <User className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-800">Informasi Profil</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama <span className="text-red-500">*</span></label>
                            <input type="text" value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {profile.errors.name && <p className="text-red-500 text-xs mt-1">{profile.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input type="email" value={profile.data.email} onChange={(e) => profile.setData('email', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                            {profile.errors.email && <p className="text-red-500 text-xs mt-1">{profile.errors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. HP</label>
                            <input type="text" value={profile.data.phone} onChange={(e) => profile.setData('phone', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="08xxxxxxxxxx" />
                            {profile.errors.phone && <p className="text-red-500 text-xs mt-1">{profile.errors.phone}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input type="text" value={user.role} disabled className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 capitalize" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={profile.processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{profile.processing ? 'Menyimpan...' : 'Simpan Profil'}</button>
                    </div>
                </form>

                {/* Ubah Password */}
                <form onSubmit={submitPassword} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <KeyRound className="w-5 h-5 text-blue-600" />
                        <h2 className="text-base font-semibold text-gray-800">Ubah Password</h2>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini <span className="text-red-500">*</span></label>
                        <input type="password" value={password.data.current_password} onChange={(e) => password.setData('current_password', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" autoComplete="current-password" />
                        {password.errors.current_password && <p className="text-red-500 text-xs mt-1">{password.errors.current_password}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru <span className="text-red-500">*</span></label>
                            <input type="password" value={password.data.password} onChange={(e) => password.setData('password', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" autoComplete="new-password" />
                            {password.errors.password && <p className="text-red-500 text-xs mt-1">{password.errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password <span className="text-red-500">*</span></label>
                            <input type="password" value={password.data.password_confirmation} onChange={(e) => password.setData('password_confirmation', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" autoComplete="new-password" />
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={password.processing} className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">{password.processing ? 'Menyimpan...' : 'Ubah Password'}</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
