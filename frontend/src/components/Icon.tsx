import React from 'react';

export type IconName =
    | 'brand'
    | 'clock'
    | 'download'
    | 'refresh'
    | 'moon'
    | 'sword'
    | 'leaf'
    | 'arrow-right'
    | 'map-pin'
    | 'shield'
    | 'box'
    | 'x-circle'
    | 'user'
    | 'controls'
    | 'search';

export default function Icon({name, size = 18, className, title}: {
    name: IconName;
    size?: number;
    className?: string;
    title?: string
}) {
    const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        role: 'img',
        'aria-hidden': title ? undefined : true,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
        className: `icon${className ? ' ' + className : ''}`,
    };

    switch (name) {
        case 'brand':
            return (
                <svg {...common} viewBox="0 0 32 32" aria-label={title}>
                    <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#4cc9f0"/>
                            <stop offset="100%" stopColor="#64dfdf"/>
                        </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#g)" stroke="none"/>
                    <path d="M10 18l6-10 6 10-6 6-6-6z" fill="#0b0f14" stroke="none"/>
                </svg>
            );
        case 'clock':
            return (
                <svg {...common} aria-label={title}>
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M12 7v5l3 3"/>
                </svg>
            );
        case 'download':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M12 3v12"/>
                    <path d="M8 11l4 4 4-4"/>
                    <path d="M5 21h14"/>
                </svg>
            );
        case 'refresh':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M21 12a9 9 0 1 1-2.64-6.36"/>
                    <path d="M21 3v6h-6"/>
                </svg>
            );
        case 'moon':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            );
        case 'sword':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M14.5 3l6 6-8.5 8.5H6v-6L14.5 3z"/>
                    <path d="M5 19l4-4"/>
                </svg>
            );
        case 'leaf':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M5 21c8-2 14-8 16-16 0 0-8 0-12 4S5 21 5 21z"/>
                </svg>
            );
        case 'arrow-right':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M5 12h14"/>
                    <path d="M13 5l7 7-7 7"/>
                </svg>
            );
        case 'map-pin':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z"/>
                    <circle cx="12" cy="11" r="2"/>
                </svg>
            );
        case 'shield':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M12 3l7 4v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"/>
                </svg>
            );
        case 'box':
            return (
                <svg {...common} aria-label={title}>
                    <path d="M3 7l9-4 9 4-9 4-9-4z"/>
                    <path d="M21 7v10l-9 4-9-4V7"/>
                </svg>
            );
        case 'x-circle':
            return (
                <svg {...common} aria-label={title}>
                    <circle cx="12" cy="12" r="9"/>
                    <path d="M9 9l6 6M15 9l-6 6"/>
                </svg>
            );
        case 'user':
            return (
                <svg {...common} aria-label={title}>
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
                </svg>
            );
        case 'controls':
            return (
                <svg {...common} aria-label={title}>
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2"
                          d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4"/>
                </svg>
            );
        case 'search':
            return (
                <svg {...common} aria-label={title}>
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M21 21l-4.3-4.3"/>
                </svg>
            );
        default:
            return null;
    }
}
