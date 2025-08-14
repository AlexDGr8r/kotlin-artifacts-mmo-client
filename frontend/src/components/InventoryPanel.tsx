import React, {useEffect, useMemo} from 'react';
import {InventorySlot} from '../api';
import useItemsCache from '../hooks/useItemsCache';
import ItemImage from './ItemImage';

export default function InventoryPanel({
  inventory,
  loading,
  error,
  onReload,
  isReady,
  slots,
  slotsLoading,
  equipTargetByInvSlot,
  setEquipTargetByInvSlot,
  onEquipFromSlot,
}: {
  inventory: Record<number, InventorySlot>;
  loading: boolean;
  error: string | null;
  onReload: () => void;
  isReady: boolean;
  slots: string[];
  slotsLoading: boolean;
  equipTargetByInvSlot: Record<number, string>;
  setEquipTargetByInvSlot: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  onEquipFromSlot: (slotNum: number) => void;
}) {
  const { get, ensure } = useItemsCache();

  const sortedEntries = useMemo(() => Object.entries(inventory).sort((a, b) => Number(a[0]) - Number(b[0])), [inventory]);

  useEffect(() => {
    const codes = sortedEntries.map(([, slot]) => (slot.code || '').trim()).filter(Boolean);
    if (codes.length) ensure(codes).then();
  }, [sortedEntries, ensure]);

  return (
    <section className="card full-bleed">
      <div className="card-header">
        <h3 className="card-title">Inventory</h3>
        <div className="row wrap">
          <button className="btn" onClick={onReload} disabled={!isReady || loading}>Reload</button>
          {loading && <span className="row" style={{ gap: 6 }}><span className="loader" /> Loading...</span>}
        </div>
      </div>
      <div className="card-body">
        {error && <div className="helper" style={{ color: '#ef476f' }}>Failed to load inventory: {error}</div>}
        {!loading && Object.keys(inventory).length === 0 && (
          <div className="helper">Inventory is empty.</div>
        )}
        <div className="inventory-grid">
          {sortedEntries.map(([slotNum, slot]) => {
            const code = (slot.code || '').trim();
            const item = code ? get(code) : undefined;
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
                  {code.length > 0 && <ItemImage code={code} />}
                  <div className="item-code" title={code}>{displayName}</div>
                </div>
                <div className="inv-slot-actions" style={{ gap: 6 }}>
                  <select
                    className="input"
                    value={equipTargetByInvSlot[Number(slotNum)] || ''}
                    onChange={(e) => setEquipTargetByInvSlot(prev => ({ ...prev, [Number(slotNum)]: e.target.value }))}
                    disabled={slotsLoading}
                  >
                    <option value="">Select Slot</option>
                    {slots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary"
                    onClick={() => onEquipFromSlot(Number(slotNum))}
                    disabled={slotsLoading || !equipTargetByInvSlot[Number(slotNum)] || !slot.code}
                    title="Equip this item"
                  >Equip</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
