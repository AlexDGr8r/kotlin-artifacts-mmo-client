import {useCallback, useMemo, useRef, useState} from 'react';
import {getItem, Item} from '../api';

export type ItemsCache = {
    get: (code: string) => Item | undefined;
    ensure: (codes: string[] | string) => Promise<void>;
    loading: Set<string>;
    errors: Record<string, string>;
};

export default function useItemsCache(): ItemsCache {
    const [cache, setCache] = useState<Record<string, Item>>({});
    const [loading, setLoading] = useState<Set<string>>(new Set());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const inflight = useRef<Record<string, Promise<void>>>({});

    const getFromCache = useCallback((code: string) => cache[code], [cache]);

    const ensure = useCallback(async (input: string[] | string) => {
        const codes = (Array.isArray(input) ? input : [input])
            .map(c => (c || '').trim())
            .filter(Boolean);
        const missing = codes.filter(c => !cache[c] && !loading.has(c) && !inflight.current[c]);
        if (missing.length === 0) return;

        // mark loading
        setLoading(prev => new Set([...Array.from(prev), ...missing]));

        await Promise.all(missing.map(code => {
            const p = getItem(code)
                .then(item => {
                    setCache(prev => ({...prev, [code]: item}));
                    setErrors(prev => {
                        const {[code]: _drop, ...rest} = prev;
                        return rest;
                    });
                })
                .catch(err => {
                    setErrors(prev => ({...prev, [code]: err?.message || String(err)}));
                })
                .finally(() => {
                    setLoading(prev => {
                        const next = new Set(prev);
                        next.delete(code);
                        return next;
                    });
                    delete inflight.current[code];
                });
            inflight.current[code] = p;
            return p;
        }));
    }, [cache, loading]);

    return useMemo(() => ({
        get: getFromCache,
        ensure,
        loading,
        errors,
    }), [getFromCache, ensure, loading, errors]);
}
