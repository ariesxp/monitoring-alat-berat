import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Combobox pencarian account interaktif.
 * Ketik kode / nama akun untuk memfilter, pilih via klik atau keyboard (↑ ↓ Enter Esc).
 */
export default function AccountCombobox({ accounts, value, onChange, error, placeholder = 'Cari / pilih account...' }) {
    const selected = useMemo(
        () => accounts.find((a) => String(a.id) === String(value)),
        [accounts, value]
    );
    const label = selected ? `${selected.account_number} - ${selected.account_description || '-'}` : '';

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState(label);
    const [highlight, setHighlight] = useState(0);
    const [rect, setRect] = useState(null);
    const wrapRef = useRef(null);
    const inputRef = useRef(null);

    // Selaraskan teks input dengan pilihan saat dropdown tertutup.
    useEffect(() => {
        if (!open) setQuery(label);
    }, [label, open]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q || q === label.toLowerCase()) return accounts.slice(0, 100);
        return accounts
            .filter((a) =>
                String(a.account_number).toLowerCase().includes(q) ||
                (a.account_description || '').toLowerCase().includes(q)
            )
            .slice(0, 100);
    }, [accounts, query, label]);

    const menuRef = useRef(null);

    const reposition = () => {
        if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
    };

    const openMenu = () => {
        reposition();
        setOpen(true);
        setHighlight(0);
    };

    useEffect(() => {
        if (!open) return;
        const onDocDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        // Saat men-scroll di dalam daftar dropdown, biarkan; untuk scroll lain,
        // reposisi dropdown agar tetap menempel pada input (bukan menutupnya).
        const onScroll = (e) => {
            if (menuRef.current && menuRef.current.contains(e.target)) return;
            reposition();
        };
        document.addEventListener('mousedown', onDocDown);
        window.addEventListener('resize', reposition);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('mousedown', onDocDown);
            window.removeEventListener('resize', reposition);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [open]);

    const select = (a) => {
        onChange(String(a.id));
        setOpen(false);
        inputRef.current?.blur();
    };

    const onKeyDown = (e) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            e.preventDefault();
            openMenu();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlight]) select(filtered[highlight]);
        } else if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={wrapRef} className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setHighlight(0);
                        if (!open) openMenu();
                    }}
                    onFocus={(e) => {
                        openMenu();
                        e.target.select();
                    }}
                    onKeyDown={onKeyDown}
                    className={`w-full pl-2 pr-7 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-400' : 'border-gray-300'}`}
                />
                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {open && rect && (
                <div
                    ref={menuRef}
                    className="fixed z-[60] bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto py-1"
                    style={{ top: rect.bottom + 4, left: rect.left, width: Math.max(rect.width, 260) }}
                >
                    {filtered.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">Tidak ada account yang cocok</div>
                    )}
                    {filtered.map((a, i) => {
                        const isSel = String(a.id) === String(value);
                        return (
                            <button
                                type="button"
                                key={a.id}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    select(a);
                                }}
                                onMouseEnter={() => setHighlight(i)}
                                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 ${i === highlight ? 'bg-blue-50' : ''} ${isSel ? 'text-blue-700 font-medium' : 'text-gray-700'}`}
                            >
                                <span className="font-mono text-xs text-gray-500 w-12 flex-shrink-0">{a.account_number}</span>
                                <span className="flex-1 truncate">{a.account_description || '-'}</span>
                                {isSel && <Check className="w-4 h-4 flex-shrink-0 text-blue-600" />}
                            </button>
                        );
                    })}
                    {filtered.length === 100 && (
                        <div className="px-3 py-1.5 text-xs text-gray-400 border-t border-gray-100">Ketik untuk mempersempit hasil…</div>
                    )}
                </div>
            )}
        </div>
    );
}
