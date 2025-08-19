import React, {useEffect, useMemo} from 'react';
import useItemsCache from '../hooks/useItemsCache';
import ItemImage from './ItemImage';
import Icon from './Icon';

export type EquipmentEntry = { key: string; label: string; apiSlot: string; code: string };

export default function EquipmentPanel({
                                           character,
                                           name,
                                           onUnequip,
                                           disabled,
                                       }: {
    character: any;
    name: string;
    onUnequip: (apiSlot: string) => Promise<void> | void;
    disabled?: boolean;
}) {
    const {get, ensure} = useItemsCache();

    const entries: EquipmentEntry[] = useMemo(() => {
        const list: EquipmentEntry[] = [];
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
                list.push({key: k, label, apiSlot, code});
            }
        }
        return list.sort((a, b) => a.label.localeCompare(b.label));
    }, [character]);

    useEffect(() => {
        const codes = entries.map(e => e.code).filter(Boolean);
        if (codes.length) ensure(codes).then();
    }, [entries, ensure]);

    if (!character || entries.length === 0) return null;

    return (
        <section className="card full-bleed">
            <div className="card-header">
                <h3 className="card-title"><Icon name="shield"/>Equipment</h3>
            </div>
            <div className="card-body">
                <div className="inventory-grid">
                    {entries.map(e => {
                        const item = get(e.code);
                        const displayName = item?.name || e.code;
                        const displayLevel = item?.level;
                        return (
                            <div key={e.key} className="inv-slot">
                                <div className="inv-slot-header">
                                    <span className="badge">{e.label}</span>
                                    {Number.isFinite(displayLevel as any) &&
                                        <span className="badge">Lv {displayLevel}</span>}
                                </div>
                                <div className="inv-slot-body">
                                    <ItemImage code={e.code}/>
                                    <div className="item-code" title={e.code}>{displayName}</div>
                                </div>
                                <div className="row fill" style={{gap: 6}}>
                                    <button
                                        className="btn"
                                        onClick={() => onUnequip(e.apiSlot)}
                                        disabled={disabled || !name}
                                        title={`Unequip ${e.label}`}
                                    >
                                        <Icon name="x-circle"/>Unequip
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
