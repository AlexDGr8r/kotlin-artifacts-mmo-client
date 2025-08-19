import React, {useCallback, useEffect, useRef, useState} from 'react';
import ItemImage from './ItemImage';
import Icon from './Icon';
import {craftItem, findItems, FindItemsSchema, getCraftStatus, Item, PagedItems} from '../api';
import JsonModal from './JsonModal';

const CRAFT_SKILLS = ['weaponcrafting', 'gearcrafting', 'jewelrycrafting', 'cooking', 'woodcutting', 'mining', 'alchemy'] as const;
const ITEM_TYPES = ['utility', 'body_armor', 'weapon', 'resource', 'leg_armor', 'helmet', 'boots', 'shield', 'amulet', 'ring', 'artifact', 'currency', 'consumable', 'rune', 'bag'] as const;
const niceLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

export default function ItemSearchModal({
                                            isOpen,
                                            onClose,
                                            characterName,
                                            initialQuery,
                                            autoSearch,
                                        }: {
    isOpen: boolean;
    onClose: () => void;
    characterName?: string | null;
    initialQuery?: FindItemsSchema;
    autoSearch?: boolean;
}) {
    const [query, setQuery] = useState<FindItemsSchema>({page: 1, pageSize: 20, ...(initialQuery || {})});
    const [results, setResults] = useState<PagedItems | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [jsonItem, setJsonItem] = useState<Item | null>(null);

    const controllerRef = useRef<AbortController | null>(null);
    // Guard to avoid duplicate auto-search executions (e.g., React StrictMode double-effects)
    const autoDidSearchRef = useRef<string | null>(null);

    const doSearch = useCallback(async (q: FindItemsSchema) => {
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();
        setLoading(true);
        setError(null);
        try {
            const res = await findItems(q);
            setResults(res);
            setHasSearched(true);
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
            controllerRef.current = null;
        }
    }, []);

    // Support auto-search when opening or when initialQuery changes while open (e.g., from "Find recipes")
    useEffect(() => {
        if (!isOpen) return;
        if (!autoSearch) return;

        // Create a stable key for the current auto-search intent
        const key = JSON.stringify({q: initialQuery || {}, sz: query.pageSize || 20});
        if (autoDidSearchRef.current === key) return; // already performed for this key (prevents double run)
        autoDidSearchRef.current = key;

        const q = {
            ...(initialQuery || {}),
            page: (initialQuery?.page ?? 1),
            pageSize: (initialQuery?.pageSize ?? query.pageSize ?? 20)
        } as FindItemsSchema;
        setQuery(prev => ({...prev, ...q}));
        setHasSearched(false);
        doSearch({...query, ...q});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, autoSearch, initialQuery]);

    // Reset auto-search key when modal closes so a future open with the same query can search again
    useEffect(() => {
        if (!isOpen) {
            autoDidSearchRef.current = null;
        }
    }, [isOpen]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        doSearch({...query, page: 1});
    }, [query, doSearch]);

    const [craftStatusByCode, setCraftStatusByCode] = useState<Record<string, {
        status?: 'idle' | 'loading' | 'ready';
        canCraft?: boolean;
        message?: string | null
    }>>({});

    const checkCraft = useCallback(async (code: string) => {
        const c = (code || '').trim();
        if (!characterName || !c) return;
        setCraftStatusByCode(prev => ({...prev, [c]: {...prev[c], status: 'loading'}}));
        try {
            const s = await getCraftStatus(characterName, c);
            setCraftStatusByCode(prev => ({...prev, [c]: {status: 'ready', canCraft: s.canCraft, message: s.message}}));
        } catch (e: any) {
            setCraftStatusByCode(prev => ({
                ...prev,
                [c]: {status: 'ready', canCraft: false, message: e?.message || String(e)}
            }));
        }
    }, [characterName]);

    const doCraft = useCallback(async (code: string, qty: number) => {
        const c = (code || '').trim();
        if (!characterName || !c) return;
        setCraftStatusByCode(prev => ({...prev, [c]: {...prev[c], status: 'loading'}}));
        try {
            await craftItem(characterName, c, Math.max(1, Math.floor(qty || 1)));
            // After crafting, re-check status so user sees updated availability
            const s = await getCraftStatus(characterName, c);
            setCraftStatusByCode(prev => ({...prev, [c]: {status: 'ready', canCraft: s.canCraft, message: s.message}}));
        } catch (e: any) {
            setCraftStatusByCode(prev => ({
                ...prev,
                [c]: {status: 'ready', canCraft: false, message: e?.message || String(e)}
            }));
        }
    }, [characterName]);

    const page = results?.page || query.page || 1;
    const pages = results?.pages || 1;
    const items: Item[] = results?.data || [];

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="card-title"><Icon name="box"/> Item Search</h3>
                    <button className="btn" onClick={onClose}><Icon name="x-circle"/>Close</button>
                </div>
                <div className="modal-body">
                    <form className="stack" onSubmit={handleSubmit}>
                        <div className="row wrap">
                            <div className="stack" style={{minWidth: 180, flex: '1 1 220px'}}>
                                <label className="input-label">Name</label>
                                <input className="input" value={query.itemName || ''} onChange={(e) => setQuery(q => ({
                                    ...q,
                                    itemName: e.target.value.length > 0 ? e.target.value : null
                                }))} placeholder="Sword, Ring..."/>
                            </div>
                            <div className="stack" style={{minWidth: 180}}>
                                <label className="input-label">Type</label>
                                <select
                                    className="input"
                                    value={query.type || ''}
                                    onChange={(e) => setQuery(q => ({
                                        ...q,
                                        type: e.target.value ? e.target.value : null
                                    }))}
                                >
                                    <option value="">Any</option>
                                    {ITEM_TYPES.map(t => (
                                        <option key={t} value={t}>{niceLabel(t)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="stack" style={{minWidth: 180}}>
                                <label className="input-label">Craft Skill</label>
                                <select
                                    className="input"
                                    value={query.craftSkill || ''}
                                    onChange={(e) => setQuery(q => ({
                                        ...q,
                                        craftSkill: e.target.value ? e.target.value : null
                                    }))}
                                >
                                    <option value="">Any</option>
                                    {CRAFT_SKILLS.map(s => (
                                        <option key={s} value={s}>{niceLabel(s)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="stack" style={{minWidth: 140}}>
                                <label className="input-label">Material Code</label>
                                <input className="input" value={query.craftMaterial || ''}
                                       onChange={(e) => setQuery(q => ({
                                           ...q,
                                           craftMaterial: e.target.value.length > 0 ? e.target.value : null
                                       }))} placeholder="iron_ore..."/>
                            </div>
                            <div className="stack" style={{minWidth: 120}}>
                                <label className="input-label">Min Level</label>
                                <input className="number-input" type="number" value={query.minLevel ?? ''}
                                       onChange={(e) => setQuery(q => ({
                                           ...q,
                                           minLevel: e.target.value ? Number(e.target.value) : null
                                       }))}/>
                            </div>
                            <div className="stack" style={{minWidth: 120}}>
                                <label className="input-label">Max Level</label>
                                <input className="number-input" type="number" value={query.maxLevel ?? ''}
                                       onChange={(e) => setQuery(q => ({
                                           ...q,
                                           maxLevel: e.target.value ? Number(e.target.value) : null
                                       }))}/>
                            </div>
                            <div className="stack" style={{minWidth: 120}}>
                                <label className="input-label">Page Size</label>
                                <input className="number-input" type="number" value={query.pageSize ?? 20}
                                       onChange={(e) => setQuery(q => ({
                                           ...q,
                                           pageSize: e.target.value ? Number(e.target.value) : 20
                                       }))}/>
                            </div>
                            <div className="row" style={{alignItems: 'flex-end'}}>
                                <button className="btn btn-accent" type="submit" disabled={loading}><Icon
                                    name="search"/>Search
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && <div className="helper" style={{color: '#ef476f'}}>Error: {error}</div>}

                    {!hasSearched && !loading && !error && (
                        <div className="helper" style={{marginTop: 10}}>
                            Enter your filters and click Search to fetch items.
                        </div>
                    )}

                    {hasSearched && (
                        <div className="stack" style={{marginTop: 10}}>
                            <div className="row" style={{justifyContent: 'space-between'}}>
                                <div className="helper">Page {page} / {pages} • {results?.total ?? 0} total</div>
                                <div className="row wrap" style={{gap: 6}}>
                                    <button className="btn" disabled={loading || page <= 1} onClick={() => {
                                        const p = Math.max(1, (page || 1) - 1);
                                        const q = {...query, page: p};
                                        setQuery(q);
                                        doSearch(q);
                                    }}>Prev
                                    </button>
                                    <button className="btn" disabled={loading || page >= (pages || 1)} onClick={() => {
                                        const p = Math.min(pages || 1, (page || 1) + 1);
                                        const q = {...query, page: p};
                                        setQuery(q);
                                        doSearch(q);
                                    }}>Next
                                    </button>
                                </div>
                            </div>

                            {loading &&
                                <div className="row" style={{gap: 6}}><span className="loader"/> Loading...</div>}

                            <div className="inventory-grid">
                                {items.map((it) => (
                                    <ItemCard key={it.code} item={it} characterName={characterName || ''}
                                              onCheck={checkCraft} onCraft={doCraft} status={craftStatusByCode[it.code]}
                                              onShowJson={setJsonItem}/>
                                ))}
                            </div>

                            {!loading && items.length === 0 && (
                                <div className="helper">No items found for the given filters.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <JsonModal
                isOpen={!!jsonItem}
                onClose={() => setJsonItem(null)}
                title={`Item JSON - ${jsonItem?.name ?? ''}`}
                data={jsonItem}
                iconName="box"
            />
        </div>
    );
}

type ItemCardProps = {
    item: Item;
    characterName: string;
    onCheck: (code: string) => void;
    onCraft: (code: string, qty: number) => void;
    status?: { status?: 'idle' | 'loading' | 'ready'; canCraft?: boolean; message?: string | null };
    onShowJson: (item: Item) => void;
};

function ItemCard({item, characterName, onCheck, onCraft, status, onShowJson}: ItemCardProps) {
    const [qty, setQty] = useState<number>(1);
    const canCheck = !!characterName;
    const st = status?.status;
    const checking = st === 'loading';
    const canCraftNow = !!status?.canCraft;
    const msg = status?.message;

    return (
        <div className="inv-slot">
            <div className="inv-slot-header">
                <span className="badge">Lv {item.level}</span>
                <span className="badge">{item.type}</span>
            </div>
            <div className="inv-slot-body">
                <ItemImage code={item.code}/>
                <div className="item-code" title={item.code}>{item.name}</div>
            </div>
            <div className="stack">
                <button className="btn" onClick={() => onCheck(item.code)} disabled={!canCheck || checking}
                        title={canCheck ? 'Check if you can craft this item' : 'Select a character first'}>
                    {checking ? <span className="row" style={{gap: 6}}><span
                        className="loader"/> Checking...</span> : 'Check Craft'}
                </button>
                <input className="input" type="number" min={1} value={qty}
                       onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}/>
                <button className="btn btn-primary" onClick={() => onCraft(item.code, qty)}
                        disabled={!canCraftNow || checking} title={msg || ''}>Craft
                </button>
                <button className="btn" onClick={() => onShowJson(item)} title="Show raw item JSON">Show JSON</button>
            </div>
            {st === 'ready' && (
                <div className="helper" style={{color: canCraftNow ? '#06d6a0' : '#ef476f'}}>
                    {canCraftNow ? 'You can craft this item.' : (msg || 'Cannot craft')}
                </div>
            )}
        </div>
    );
}
