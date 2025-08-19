import React, {useEffect, useState} from 'react';
import {getAllCharacters} from '../api';

export default function CharacterSelect({
                                            value,
                                            onChange,
                                            id = 'charName',
                                            label = 'Character',
                                        }: {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    label?: string;
}) {
    const [names, setNames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const list = await getAllCharacters();
                const values = Array.isArray(list)
                    ? list.map((c: any) => c?.name).filter((n: any) => typeof n === 'string')
                    : [];
                if (!cancelled) setNames(values);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || String(e));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="stack">
            <label className="input-label" htmlFor={id}>{label}</label>
            <select
                id={id}
                className="input"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={loading}
            >
                <option value="">{loading ? 'Loading characters...' : 'Select a character'}</option>
                {names.map((n) => (
                    <option key={n} value={n}>{n}</option>
                ))}
            </select>
            {error && (
                <div className="helper" style={{color: '#ef476f'}}>
                    Failed to load character list: {error}
                </div>
            )}
            {!loading && names.length === 0 && !error && (
                <div className="helper">No characters found. Create one in the game, then try again.</div>
            )}
        </div>
    );
}
