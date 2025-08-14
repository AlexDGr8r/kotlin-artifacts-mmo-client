import React, {useEffect, useMemo, useState} from "react";
import {
    GiAxeInStump,
    GiBattleGear,
    GiBoatFishing,
    GiCampCookingPot,
    GiCharacter,
    GiDiamondRing,
    GiMining,
    GiPotionBall,
    GiSwordSmithing,
    GiTwoCoins
} from "react-icons/gi";
import JsonView from "./JsonView";

// Skill icon mapping
const skillIcons: Record<string, JSX.Element> = {
    mining: <GiMining/>,
    woodcutting: <GiAxeInStump/>,
    fishing: <GiBoatFishing/>,
    weaponcrafting: <GiSwordSmithing/>,
    gearcrafting: <GiBattleGear/>,
    jewelrycrafting: <GiDiamondRing/>,
    cooking: <GiCampCookingPot/>,
    alchemy: <GiPotionBall/>,
};

export default function CharacterDetails({data}: { data: any }) {
    const [showRaw, setShowRaw] = useState(false);

    const val = (v: any) => (v === null || v === undefined ? "-" : v);

    const [tick, setTick] = useState(0);
    useEffect(() => {
        if (!data?.cooldown_expiration) return;
        const id = setInterval(() => setTick((t) => (t + 1) % 1_000_000), 1000);
        return () => clearInterval(id);
    }, [data?.cooldown_expiration]);

    const xpBars: Array<{ label: string; value: number; max: number; skillKey: string }> = useMemo(() => {
        const bars: Array<{ label: string; value: number; max: number; skillKey: string }> = [];
        const overallX = Number((data as any)?.xp);
        const overallMax = Number((data as any)?.max_xp);
        if (Number.isFinite(overallX) && Number.isFinite(overallMax) && overallMax > 0) {
            bars.push({label: "XP", value: overallX, max: overallMax, skillKey: "overall"});
        }
        if (data && typeof data === "object") {
            for (const k of Object.keys(data)) {
                if (k === "xp") continue;
                if (k.endsWith("_xp")) {
                    const skillName = k.slice(0, -3);
                    const maxKey = `${skillName}_max_xp`;
                    const levelKey = `${skillName}_level`;
                    const cur = Number((data as any)[k]);
                    const max = Number((data as any)[maxKey]);
                    const level = Number((data as any)[levelKey]);
                    if (Number.isFinite(cur) && Number.isFinite(max) && max > 0) {
                        const nice = skillName
                            ? (skillName.charAt(0).toUpperCase() + skillName.slice(1)).replace(/_/g, " ") + " - Lvl " + level
                            : "XP";
                        bars.push({label: nice, value: cur, max, skillKey: skillName});
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
                    <div className="kv">
                        <div className="k">Name</div>
                        <div className="v">{val(data.name)}</div>
                    </div>
                )}
                {data?.level !== undefined && (
                    <div className="kv">
                        <div className="k">Level</div>
                        <div className="v">{val(data.level)}</div>
                    </div>
                )}
                {data?.gold !== undefined && (
                    <div className="kv">
                        <div className="k"><GiTwoCoins/> Gold</div>
                        <div className="v">{val(data.gold)}</div>
                    </div>
                )}
            </div>

            {Number.isFinite(Number(data?.hp)) && Number.isFinite(Number(data?.max_hp)) && Number(data?.max_hp) > 0 && (
                <div className="stack">
                    <div className="section-title">Health</div>
                    {(() => {
                        const hp = Number(data.hp);
                        const max = Number(data.max_hp);
                        const pct = Math.max(0, Math.min(100, (hp / max) * 100));
                        return (
                            <div className="progress danger" title={`${hp} / ${max}`}>
                                <div className="progress-fill" style={{width: `${pct}%`}}/>
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
                                    <div className="row" style={{justifyContent: "space-between"}}>
                                        {/* Icon and label render */}
                                        <div className="row"
                                             style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                                            {skillIcons[b.skillKey] || <GiCharacter/>} {/* Default icon fallback */}
                                            <div className="helper">{b.label}</div>
                                        </div>
                                    </div>
                                    <div className="progress" title={`${b.value} / ${b.max}`}>
                                        <div className="progress-fill" style={{width: `${pct}%`}}/>
                                        <div className="progress-text">{b.value} / {b.max}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="row wrap">
                <button className="btn" onClick={() => setShowRaw((s) => !s)}>
                    {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
                </button>
            </div>

            {showRaw && <JsonView data={data}/>}
        </div>
    );
}
