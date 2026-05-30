import { router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchFilter({ route, filters = {}, placeholder = 'Cari...', children }) {
    const [search, setSearch] = useState(filters.search || '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route, { ...filters, search: search || undefined, page: undefined }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
            {children}
        </div>
    );
}
