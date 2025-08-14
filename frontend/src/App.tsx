import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Destination,
    equip,
    fight,
    gather,
    gatherAt,
    getAllCharacters,
    getCharacter,
    getInventory,
    getItem,
    getSlots,
    InventorySlot,
    Item,
    move,
    refreshCharacter,
    rest,
    unequip
} from './api';

// Simple relative time formatter: returns phrases like "in 30 seconds" or "30 seconds ago"
function formatRelativeTime(target: Date | string | number, nowInput?: Date): string {
    const now = nowInput ?? new Date();
    const t = target instanceof Date ? target : new Date(target);
    if (isNaN(t.getTime())) return '-';
    let diffMs = t.getTime() - now.getTime();
    const past = diffMs < 0;
    diffMs = Math.abs(diffMs);

    const sec = Math.round(diffMs / 1000);
    const min = Math.round(sec / 60);
    const hr = Math.round(min / 60);
    const day = Math.round(hr / 24);

    let unit: string;
    let value: number;
    if (sec < 60) { unit = 'second'; value = sec; }
    else if (min < 60) { unit = 'minute'; value = min; }
    else if (hr < 24) { unit = 'hour'; value = hr; }
    else { unit = 'day'; value = day; }

    const plural = value === 1 ? '' : 's';
    return past ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
}

// Build item image URL from code
const itemImageUrl = (code: string) => `https://client.artifactsmmo.com/images/items/${code}.png`;

// Shared <img> onError handler: retry lowercase once, then hide
function handleItemImgError(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    // use alt to store original code
    const original = img.alt || '';
    if (!img.dataset.lcTried && original) {
        img.dataset.lcTried = '1';
        img.src = itemImageUrl(original.toLowerCase());
    } else {
        img.style.display = 'none';
    }
}

// On successful load, ensure previously hidden or flagged images are reset
function handleItemImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    if (img.style.display === 'none') img.style.display = '';
    if (img.dataset.lcTried) delete img.dataset.lcTried;
}

function JsonView({data}: { data: unknown }) {
    const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
    return <pre className="json">{text}</pre>;
}

function CharacterDetails({ data }: { data: any }) {
    const [showRaw, setShowRaw] = useState(false);

    // Best-effort safe access helpers
    const val = (v: any) => (v === null || v === undefined) ? '-' : v;

    // Local ticking for live relative cooldown display
    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!data?.cooldown_expiration) return;
        const id = setInterval(() => setTick(t => (t + 1) % 1_000_000), 1000);
        return () => clearInterval(id);
    }, [data?.cooldown_expiration]);

    // XP bars: overall xp/max_xp and any *_xp with corresponding *_max_xp
    const xpBars: Array<{ label: string; value: number; max: number }> = useMemo(() => {
        const bars: Array<{ label: string; value: number; max: number }> = [];
        const overallX = Number((data as any)?.xp);
        const overallMax = Number((data as any)?.max_xp);
        if (Number.isFinite(overallX) && Number.isFinite(overallMax) && overallMax > 0) {
            bars.push({ label: 'XP', value: overallX, max: overallMax });
        }
        if (data && typeof data === 'object') {
            for (const k of Object.keys(data)) {
                if (k === 'xp') continue;
                if (k.endsWith('_xp')) {
                    const prefix = k.slice(0, -3);
                    const maxKey = `${prefix}_max_xp`;
                    const cur = Number((data as any)[k]);
                    const max = Number((data as any)[maxKey]);
                    if (Number.isFinite(cur) && Number.isFinite(max) && max > 0) {
                        const nice = prefix
                            ? (prefix.charAt(0).toUpperCase() + prefix.slice(1)).replace(/_/g, ' ') + ' XP'
                            : 'XP';
                        bars.push({ label: nice, value: cur, max });
                    }
                }
            }
        }
        return bars;
    }, [data]);

    return (
        <div className="stack">
            <div className="kv-grid">
                {data?.name !== undefined && (
                    <div className="kv"><div className="k">Name</div><div className="v">{val(data.name)}</div></div>
                )}
                {data?.level !== undefined && (
                    <div className="kv"><div className="k">Level</div><div className="v">{val(data.level)}</div></div>
                )}
                {data?.gold !== undefined && (
                    <div className="kv"><div className="k">Gold</div><div className="v">{val(data.gold)}</div></div>
                )}
                {data?.profession !== undefined && (
                    <div className="kv"><div className="k">Profession</div><div className="v">{val(data.profession)}</div></div>
                )}
            </div>

            {/* Health bar */}
            {(Number.isFinite(Number(data?.hp)) && Number.isFinite(Number(data?.max_hp)) && Number(data?.max_hp) > 0) && (
                <div className="stack">
                    <div className="section-title">Health</div>
                    {(() => {
                        const hp = Number(data.hp);
                        const max = Number(data.max_hp);
                        const pct = Math.max(0, Math.min(100, (hp / max) * 100));
                        return (
                            <div className="progress danger" title={`${hp} / ${max}`}>
                                <div className="progress-fill" style={{ width: `${pct}%` }} />
                                <div className="progress-text">{hp} / {max}</div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {xpBars.length > 0 && (
                <div className="stack">
                    <div className="section-title">Experience</div>
                    <div className="stack">
                        {xpBars.map((b, i) => {
                            const pct = Math.max(0, Math.min(100, b.max ? (b.value / b.max) * 100 : 0));
                            return (
                                <div key={b.label + i} className="stack">
                                    <div className="row" style={{ justifyContent: 'space-between' }}>
                                        <div className="helper">{b.label}</div>
                                    </div>
                                    <div className="progress" title={`${b.value} / ${b.max}`}>
                                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                                        <div className="progress-text">{b.value} / {b.max}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="row wrap">
                <button className="btn" onClick={() => setShowRaw(s => !s)}>
                    {showRaw ? 'Hide Raw JSON' : 'Show Raw JSON'}
                </button>
            </div>

            {showRaw && <JsonView data={data} />}
        </div>
    );
}

export default function App() {
    const [name, setName] = useState<string>('');
    const [character, setCharacter] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldownText, setCooldownText] = useState<string>('');
    const [dest, setDest] = useState<Destination>({x: 0, y: 0});
    const [charNames, setCharNames] = useState<string[]>([]);
    const [namesLoading, setNamesLoading] = useState<boolean>(false);
    const [namesError, setNamesError] = useState<string | null>(null);
    // Unequip controls state
    const [slots, setSlots] = useState<string[]>([]);
    const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
    const [slotsError, setSlotsError] = useState<string | null>(null);

    // Inventory state
    const [inventory, setInventory] = useState<Record<number, InventorySlot>>({});
    const [inventoryLoading, setInventoryLoading] = useState<boolean>(false);
    const [inventoryError, setInventoryError] = useState<string | null>(null);

    // Item details cache: code -> item
    const [itemCache, setItemCache] = useState<Record<string, Item>>({});
    const [itemLoadingCodes, setItemLoadingCodes] = useState<Set<string>>(new Set());
    const [itemErrors, setItemErrors] = useState<Record<string, string>>({});

    // Live header cooldown relative time tick
    const [timeTick, setTimeTick] = useState(0);
    useEffect(() => {
        if (!character?.cooldown_expiration) return;
        const id = setInterval(() => setTimeTick(t => (t + 1) % 1_000_000), 1000);
        return () => clearInterval(id);
    }, [character?.cooldown_expiration]);

    const headerCooldownDate = useMemo(() => {
        return character?.cooldown_expiration ? new Date(character.cooldown_expiration) : null;
    }, [character?.cooldown_expiration]);

    const headerCooldownRelative = useMemo(() => {
        if (!headerCooldownDate || isNaN(headerCooldownDate.getTime())) return null;
        return formatRelativeTime(headerCooldownDate);
    }, [headerCooldownDate, timeTick]);

    const headerCooldownFuture = useMemo(() => {
        if (!headerCooldownDate || isNaN(headerCooldownDate.getTime())) return false;
        return headerCooldownDate.getTime() > Date.now();
    }, [headerCooldownDate, timeTick]);

    useEffect(() => {
        let cancelled = false;

        async function loadNames() {
            setNamesLoading(true);
            setNamesError(null);
            try {
                const list = await getAllCharacters();
                // list is expected to be an array of character entities with a 'name' field
                const names = Array.isArray(list) ? list.map((c: any) => c?.name).filter((n: any) => typeof n === 'string') : [];
                if (!cancelled) setCharNames(names);
            } catch (e: any) {
                if (!cancelled) setNamesError(e?.message || String(e));
            } finally {
                if (!cancelled) setNamesLoading(false);
            }
        }

        loadNames().then();
        return () => {
            cancelled = true;
        };
    }, []);

    // Load available equipment slots once
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setSlotsLoading(true);
            setSlotsError(null);
            try {
                const list = await getSlots();
                const options = Array.isArray(list) ? list.map((s: any) => String(s)).filter(Boolean) : [];
                if (!cancelled) setSlots(options);
            } catch (e: any) {
                if (!cancelled) setSlotsError(e?.message || String(e));
            } finally {
                if (!cancelled) setSlotsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const loadInventory = useCallback(async () => {
        if (!name) return;
        setInventoryLoading(true);
        setInventoryError(null);
        try {
            const data = await getInventory(name);
            setInventory(data || {});
        } catch (e: any) {
            setInventoryError(e?.message || String(e));
        } finally {
            setInventoryLoading(false);
        }
    }, [name]);

    const load = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getCharacter(name);
            setCharacter(data ?? null);
            await loadInventory();
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, loadInventory]);

    const doRefresh = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await refreshCharacter(name);
            setCharacter(data ?? null);
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, load]);

    const doFight = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            await fight(name, true);
            await load();
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, load]);

    const doRest = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await rest(name);
            setCharacter(data ?? null);
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, load]);

    const doMove = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await move(name, dest);
            setCharacter(data ?? null);
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, dest, load]);

    const doGather = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            const data = await gather(name);
            setCharacter(data ?? null);
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, load])

    const doGatherAt = useCallback(async () => {
        if (!name) return;
        setLoading(true);
        setError(null);
        try {
            await gatherAt(name, dest);
            await load();
        } catch (e: any) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, dest, load])

    useEffect(() => {
        setCharacter(null);
        setCooldownText('');
        setInventory({});
        setInventoryError(null);
        // Reset item details when switching character
        setItemCache({});
        setItemLoadingCodes(new Set());
        setItemErrors({});
    }, [name]);

    const [equipTargetByInvSlot, setEquipTargetByInvSlot] = useState<Record<number, string>>({});

    const doEquipFromSlot = useCallback(async (invSlotNum: number) => {
        if (!name) return;
        const invSlot = inventory[invSlotNum];
        if (!invSlot || !invSlot.code) return; // ignore empty slots safety
        const targetSlot = equipTargetByInvSlot[invSlotNum];
        if (!targetSlot) {
            setError('Select an equipment slot first.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await equip(name, { slot: targetSlot, code: invSlot.code });
            await Promise.all([load(), loadInventory()]);
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    }, [name, inventory, equipTargetByInvSlot, load, loadInventory]);

    const isReady = !!name && !loading;

    return (
        <div className="app-shell">
            <header className="header">
                <div className="header-inner">
                    <div className="brand">
                        <div className="brand-badge"/>
                        <div className="brand-title">Artifacts MMO Client</div>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                        {headerCooldownRelative ? (
                            <span className={"badge " + (headerCooldownFuture ? 'badge-accent' : 'badge-success')} title={headerCooldownDate ? headerCooldownDate.toString() : 'Cooldown status'}>
                                Cooldown {headerCooldownRelative}
                            </span>
                        ) : cooldownText ? (
                            <span className="badge badge-accent" title="Cooldown status">{cooldownText}</span>
                        ) : (
                            <span className="badge badge-success">Ready</span>
                        )}
                    </div>
                </div>
            </header>

            <main className="page">
                <div className="grid">
                    {/* Controls panel */}
                    <section className="panel">
                        <div className="panel-inner stack">
                            <div className="row wrap">
                                <h3 className="panel-title">Controls</h3>
                                {loading &&
                                    <span className="row" style={{gap: 6}}><span className="loader"/> Loading...</span>}
                            </div>

                            {error && <div className="helper" style={{color: '#ef476f'}}>Error: {error}</div>}
                            {!name && <div className="helper">Select a character to begin.</div>}

                            <div className="stack">
                                <label className="input-label" htmlFor="charName">Character</label>
                                <select
                                    id="charName"
                                    className="input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={namesLoading}
                                >
                                    <option
                                        value="">{namesLoading ? 'Loading characters...' : 'Select a character'}</option>
                                    {charNames.map((n) => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                                {namesError &&
                                    <div className="helper" style={{color: '#ef476f'}}>Failed to load character
                                        list: {namesError}</div>}
                                {!namesLoading && charNames.length === 0 && !namesError && (
                                    <div className="helper">No characters found. Create one in the game, then click
                                        Refresh to try again.</div>
                                )}
                            </div>

                            <div className="row wrap fill">
                                <button className="btn btn-accent" onClick={load} disabled={!isReady}>Load</button>
                                <button className="btn btn-primary" onClick={doRefresh} disabled={!isReady}>Refresh</button>
                            </div>

                            <div className="row wrap fill">
                                <button className="btn" onClick={doRest} disabled={!isReady}>Rest</button>
                                <button className="btn btn-danger" onClick={doFight} disabled={!isReady}>Fight</button>
                                <button className="btn" onClick={doGather} disabled={!isReady}>Gather</button>
                            </div>

                            <div className="stack">
                                <label className="input-label">With coordinates</label>
                                <div className="row wrap">
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={dest.x}
                                        onChange={(e) => setDest({...dest, x: Number(e.target.value)})}
                                        placeholder="X"
                                    />
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={dest.y}
                                        onChange={(e) => setDest({...dest, y: Number(e.target.value)})}
                                        placeholder="Y"
                                    />
                                </div>
                                <div className="row wrap fill">
                                    <button className="btn" onClick={doMove} disabled={!isReady}>Move</button>
                                    <button className="btn" onClick={doGatherAt} disabled={!isReady}>Gather</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data panel */}
                    <section className="card">
                        <div className="card-header">
                            <h3 className="card-title">Character</h3>
                            {character && (
                                <div className="row wrap" style={{gap: 8}}>
                                    <span className="badge">At {character.x ?? '-'},{character.y ?? '-'}</span>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            {character ? (
                                <CharacterDetails data={character} />
                            ) : (
                                <div className="helper">No character loaded.</div>
                            )}
                        </div>
                    </section>

                    {/* Equipment panel */}
                    {character && (() => {
                        // Build entries for any top-level *_slot fields with a non-empty value
                        const entries: Array<{ key: string; label: string; apiSlot: string; code: string } > = [];
                        const c: any = character;
                        if (c && typeof c === 'object') {
                            for (const k of Object.keys(c)) {
                                if (!k.toLowerCase().endsWith('_slot')) continue;
                                const val = (c as any)[k];
                                if (val === null || val === undefined || val === '' || (typeof val === 'object' && !val.code && !val.name)) continue;
                                const apiSlot = k.replace(/_slot$/i, '').toLowerCase();
                                const pretty = apiSlot.charAt(0) + apiSlot.slice(1).toLowerCase();
                                const label = pretty.replace(/_/g, ' ');
                                const code = (typeof val === 'object' ? (val.code ?? val.name ?? String(val)) : String(val)).trim();
                                entries.push({ key: k, label, apiSlot, code });
                            }
                        }
                        if (entries.length === 0) return null;

                        // Trigger fetch for any missing equipment item details
                        const codesToFetch = entries.map(e => e.code).filter(code => code && !itemCache[code] && !itemLoadingCodes.has(code));
                        if (codesToFetch.length > 0) {
                            (async () => {
                                // mark as loading
                                setItemLoadingCodes(prev => new Set([...Array.from(prev), ...codesToFetch]));
                                try {
                                    const items = await Promise.all(codesToFetch.map(c => getItem(c).catch(err => ({ __err: String(err), code: c }) as any)));
                                    setItemCache(prev => {
                                        const next = { ...prev } as Record<string, Item>;
                                        for (const it of items) {
                                            if (it && !(it as any).__err) next[it.code] = it as Item;
                                        }
                                        return next;
                                    });
                                    setItemErrors(prev => {
                                        const next = { ...prev };
                                        for (const it of items) {
                                            if ((it as any)?.__err) next[(it as any).code] = (it as any).__err;
                                        }
                                        return next;
                                    });
                                } finally {
                                    setItemLoadingCodes(prev => {
                                        const next = new Set(prev);
                                        codesToFetch.forEach(c => next.delete(c));
                                        return next;
                                    });
                                }
                            })();
                        }

                        return (
                            <section className="card full-bleed">
                                <div className="card-header">
                                    <h3 className="card-title">Equipment</h3>
                                </div>
                                <div className="card-body">
                                    <div className="inventory-grid">
                                        {entries.sort((a,b)=> a.label.localeCompare(b.label)).map((e) => {
                                            const item = itemCache[e.code];
                                            const displayName = item?.name || e.code;
                                            const displayLevel = item?.level;
                                            return (
                                                <div key={e.key} className="inv-slot">
                                                    <div className="inv-slot-header">
                                                        <span className="badge">{e.label}</span>
                                                        {Number.isFinite(displayLevel as any) && <span className="badge">Lv {displayLevel}</span>}
                                                    </div>
                                                    <div className="inv-slot-body">
                                                        <img
                                                            key={e.code}
                                                            className="item-img"
                                                            src={itemImageUrl(e.code)}
                                                            alt={e.code}
                                                            loading="lazy"
                                                            onLoad={handleItemImgLoad}
                                                            onError={handleItemImgError}
                                                        />
                                                        <div className="item-code" title={e.code}>{displayName}</div>
                                                    </div>
                                                    <div className="inv-slot-actions" style={{gap: 6}}>
                                                        <button
                                                            className="btn"
                                                            onClick={async () => {
                                                                if (!name) return;
                                                                setLoading(true);
                                                                setError(null);
                                                                try {
                                                                    await unequip(name, { slot: e.apiSlot });
                                                                    await load(); // load() calls loadInventory too
                                                                } catch (err: any) {
                                                                    setError(err?.message || String(err));
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            disabled={loading || !name}
                                                            title={`Unequip ${e.label}`}
                                                        >Unequip</button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        );
                    })()}

                    {/* Inventory panel */}
                    <section className="card full-bleed">
                        <div className="card-header">
                            <h3 className="card-title">Inventory</h3>
                            <div className="row wrap">
                                <button className="btn" onClick={loadInventory} disabled={!isReady || inventoryLoading}>Reload</button>
                                {inventoryLoading && <span className="row" style={{gap: 6}}><span className="loader"/> Loading...</span>}
                            </div>
                        </div>
                        <div className="card-body">
                            {inventoryError && <div className="helper" style={{color: '#ef476f'}}>Failed to load inventory: {inventoryError}</div>}
                            {!inventoryLoading && Object.keys(inventory).length === 0 && (
                                <div className="helper">Inventory is empty.</div>
                            )}
                            <div className="inventory-grid">
                                {Object.entries(inventory).sort((a,b)=> Number(a[0]) - Number(b[0])).map(([slotNum, slot]) => {
                                    // ensure we have details for this code
                                    const code = (slot.code || '').trim();
                                    if (code && !itemCache[code] && !itemLoadingCodes.has(code)) {
                                        (async () => {
                                            setItemLoadingCodes(prev => new Set([...Array.from(prev), code]));
                                            try {
                                                const item = await getItem(code);
                                                setItemCache(prev => ({ ...prev, [code]: item }));
                                            } catch (err: any) {
                                                setItemErrors(prev => ({ ...prev, [code]: err?.message || String(err) }));
                                            } finally {
                                                setItemLoadingCodes(prev => { const next = new Set(prev); next.delete(code); return next; });
                                            }
                                        })();
                                    }
                                    const item = itemCache[code];
                                    const displayName = item?.name || code;
                                    const displayLevel = item?.level;
                                    return (
                                        <div key={slotNum} className="inv-slot">
                                            <div className="inv-slot-header">
                                                <span className="badge">Slot {slotNum}</span>
                                                <span className="badge">Qty {slot.quantity}</span>
                                                {Number.isFinite(displayLevel as any) && <span className="badge">Lvl {displayLevel}</span>}
                                            </div>
                                            <div className="inv-slot-body">
                                                {code.length > 0 && <img
                                                    key={slot.code}
                                                    className="item-img"
                                                    src={itemImageUrl(code)}
                                                    alt={code}
                                                    loading="lazy"
                                                    onLoad={handleItemImgLoad}
                                                    onError={handleItemImgError}
                                                />}
                                                <div className="item-code" title={code}>{displayName}</div>
                                            </div>
                                            <div className="inv-slot-actions" style={{gap: 6}}>
                                                <select
                                                    className="input"
                                                    value={equipTargetByInvSlot[Number(slotNum)] || ''}
                                                    onChange={(e) => setEquipTargetByInvSlot(prev => ({...prev, [Number(slotNum)]: e.target.value}))}
                                                    disabled={slotsLoading}
                                                >
                                                    <option value="">Select Slot</option>
                                                    {slots.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => doEquipFromSlot(Number(slotNum))}
                                                    disabled={loading || slotsLoading || !equipTargetByInvSlot[Number(slotNum)] || !slot.code}
                                                    title="Equip this item"
                                                >Equip</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="footer">
                Dev server proxies API calls to http://localhost:8080. Run backend first.
            </footer>
        </div>
    );
}
