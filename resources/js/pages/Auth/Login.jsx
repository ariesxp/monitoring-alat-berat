import { useEffect, useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Mail, Lock, Eye, EyeOff, Loader2, Truck, BarChart3, Users } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset('password');
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex bg-slate-50">
                {/* Left - Form */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <div className="inline-flex items-center gap-3 mb-6">
                                <img src="/logo-aob.png" alt="Logo AOB" className="w-12 h-12 object-contain" />
                                <span className="text-2xl font-bold text-slate-900">
                                    AOB System
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Selamat Datang
                            </h1>
                            <p className="mt-2 text-slate-600">
                                Masuk untuk mengakses dashboard Anda
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        autoFocus
                                        className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 ${
                                            errors.email
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-slate-200 focus:border-blue-500'
                                        } bg-white text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none`}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 ${
                                            errors.password
                                                ? 'border-red-500 focus:border-red-500'
                                                : 'border-slate-200 focus:border-blue-500'
                                        } bg-white text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember */}
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600">Ingat saya</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>

                            <p className="text-center text-sm text-slate-500 mt-4 tracking-widest font-medium">
                                Precision · Capacity · Reliability
                            </p>
                        </form>
                    </div>
                </div>

                {/* Right - Decoration */}
                <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
                    <div className="max-w-md text-center text-white">
                        <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8">
                            <img src="/logo-aob.png" alt="Logo AOB" className="w-16 h-16 object-contain" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">
                            Kelola Alat Berat Anda dengan Mudah
                        </h2>
                        <p className="text-lg opacity-90">
                            Sistem monitoring modern yang membantu Anda memantau
                            kondisi, lokasi, dan performa alat berat secara real-time.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            {['Monitoring Real-time', 'Laporan Lengkap', 'Multi Unit'].map((feature, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-white/20 rounded-full text-sm font-medium"
                                >
                                    {feature}
                                </span>
                            ))}
                        </div>
                        <p className="mt-6 text-sm tracking-widest font-medium opacity-80">
                            Precision · Capacity · Reliability
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
