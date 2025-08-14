import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import CharacterDetails from './components/CharacterDetails';
import EquipmentPanel from './components/EquipmentPanel';
import InventoryPanel from './components/InventoryPanel';
import {
    Destination,
    equip,
    fight,
    gather,
    gatherAt,
    getAllCharacters,
    getCharacter,
    getInventory,
    getSlots,
    InventorySlot,
    move,
    refreshCharacter,
    rest,
    unequip
} from './api';
import Icon from './components/Icon';

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
    if (sec < 60) {
        unit = 'second';
        value = sec;
    } else if (min < 60) {
        unit = 'minute';
        value = min;
    } else if (hr < 24) {
        unit = 'hour';
        value = hr;
    } else {
        unit = 'day';
        value = day;
    }

    const plural = value === 1 ? '' : 's';
    return past ? `${value} ${unit}${plural} ago` : `in ${value} ${unit}${plural}`;
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
        return () => {
            cancelled = true;
        };
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

    // Auto-load when cooldown expires with a 1s buffer
    const lastAutoLoadAtRef = useRef<number | null>(null);
    useEffect(() => {
        if (!name) return;
        const t = headerCooldownDate?.getTime();
        if (!t || !Number.isFinite(t)) return;
        const mark = t; // use timestamp as a unique marker
        const now = Date.now();
        const delay = t - now + 2000; // 2s buffer after cooldown
        if (delay <= 0) {
            if (lastAutoLoadAtRef.current !== mark && !loading) {
                lastAutoLoadAtRef.current = mark;
                load().then();
            }
            return;
        }
        const id = setTimeout(() => {
            if (lastAutoLoadAtRef.current !== mark) {
                lastAutoLoadAtRef.current = mark;
                load().then();
            }
        }, delay);
        return () => clearTimeout(id);
    }, [name, headerCooldownDate, load, loading]);

    useEffect(() => {
        setCharacter(null);
        setCooldownText('');
        setInventory({});
        setInventoryError(null);
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
            await equip(name, {slot: targetSlot, code: invSlot.code});
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
                            <span className={"badge " + (headerCooldownFuture ? 'badge-accent' : 'badge-success')}
                                  title={headerCooldownDate ? headerCooldownDate.toString() : 'Cooldown status'}>
                                <Icon name="clock"/>Cooldown {headerCooldownRelative}
                            </span>
                        ) : cooldownText ? (
                            <span className="badge badge-accent" title="Cooldown status"><Icon
                                name="clock"/>{cooldownText}</span>
                        ) : (
                            <span className="badge badge-success"><Icon name="clock"/>Ready</span>
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
                                <h3 className="panel-title"><Icon name={"controls"}/>Controls</h3>
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
                                <button className="btn btn-accent" onClick={load} disabled={!isReady}><Icon
                                    name="download"/>Load
                                </button>
                                <button className="btn btn-primary" onClick={doRefresh} disabled={!isReady}><Icon
                                    name="refresh"/>Refresh
                                </button>
                            </div>

                            <div className="row wrap fill">
                                <button className="btn" onClick={doRest} disabled={!isReady}><Icon name="moon"/>Rest
                                </button>
                                <button className="btn btn-danger" onClick={doFight} disabled={!isReady}><Icon
                                    name="sword"/>Fight
                                </button>
                                <button className="btn" onClick={doGather} disabled={!isReady}><Icon name="leaf"/>Gather
                                </button>
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
                                    <button className="btn" onClick={doMove} disabled={!isReady}><Icon
                                        name="arrow-right"/>Move
                                    </button>
                                    <button className="btn" onClick={doGatherAt} disabled={!isReady}><Icon name="leaf"/>Gather
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Data panel */}
                    <section className="card">
                        <div className="card-header">
                            <h3 className="card-title"><Icon name="user"/>Character</h3>
                            {character && (
                                <div className="row wrap" style={{gap: 8}}>
                                    <span className="badge"><Icon
                                        name="map-pin"/>{character.x ?? '-'},{character.y ?? '-'}</span>
                                </div>
                            )}
                        </div>
                        <div className="card-body">
                            {character ? (
                                <CharacterDetails data={character}/>
                            ) : (
                                <div className="helper">No character loaded.</div>
                            )}
                        </div>
                    </section>

                    {/* Equipment panel */}
                    {character && (
                        <EquipmentPanel
                            character={character}
                            name={name}
                            disabled={loading}
                            onUnequip={async (apiSlot) => {
                                if (!name) return;
                                setLoading(true);
                                setError(null);
                                try {
                                    await unequip(name, {slot: apiSlot});
                                    await load();
                                } catch (err: any) {
                                    setError(err?.message || String(err));
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        />
                    )}

                    {/* Inventory panel */}
                    <InventoryPanel
                        inventory={inventory}
                        loading={inventoryLoading}
                        error={inventoryError}
                        onReload={loadInventory}
                        isReady={isReady}
                        slots={slots}
                        slotsLoading={slotsLoading}
                        equipTargetByInvSlot={equipTargetByInvSlot}
                        setEquipTargetByInvSlot={setEquipTargetByInvSlot}
                        onEquipFromSlot={doEquipFromSlot}
                    />
                </div>
            </main>

            <footer className="footer">
                Dev server proxies API calls to http://localhost:8080. Run backend first.
            </footer>
        </div>
    );
}
