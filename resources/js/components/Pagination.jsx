import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center justify-center gap-1 mt-4">
            {links.map((link, i) => (
                <Link
                    key={i}
                    href={link.url || '#'}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                        link.active
                            ? 'bg-blue-600 text-white'
                            : link.url
                            ? 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                    preserveScroll
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            ))}
        </div>
    );
}
