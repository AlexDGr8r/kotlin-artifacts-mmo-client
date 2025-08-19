import React, {useCallback, useMemo, useState} from 'react';
import CharacterSelect from '../components/CharacterSelect';
import Icon from '../components/Icon';
import JsonView from '../components/JsonView';
import {GatherResource, getRoutine, startGatherRoutine} from '../api';

function toIsoDurationFromMinutes(min?: number | null): string | undefined {
    if (min == null || isNaN(min) || min <= 0) return undefined;
    return `PT${Math.round(min)}M`;
}

export default function RoutinesPage() {
    const [name, setName] = useState<string>('');
    const [currentRoutine, setCurrentRoutine] = useState<any | null>(null);
    const [loadingRoutine, setLoadingRoutine] = useState(false);
    const [routineError, setRoutineError] = useState<string | null>(null);

    // Gather form state
    const [gatherResource, setGatherResource] = useState<GatherResource>('COPPER');
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMsg, setSubmitMsg] = useState<string | null>(null);

    const isReady = useMemo(() => !!name && !loadingRoutine && !submitLoading, [name, loadingRoutine, submitLoading]);

    const fetchRoutine = useCallback(async () => {
        if (!name) return;
        setRoutineError(null);
        setLoadingRoutine(true);
        try {
            const data = await getRoutine(name);
            setCurrentRoutine(data); // null means none
        } catch (e: any) {
            setRoutineError(e?.message || String(e));
        } finally {
            setLoadingRoutine(false);
        }
    }, [name]);

    const doStartGather = useCallback(async () => {
        if (!name) return;
        setSubmitLoading(true);
        setSubmitMsg(null);
        setRoutineError(null);
        try {
            const iso = toIsoDurationFromMinutes(typeof durationMinutes === 'number' ? durationMinutes : null);
            await startGatherRoutine(name, {gatherResource, duration: iso});
            setSubmitMsg('Gather routine started.');
            await fetchRoutine();
        } catch (e: any) {
            setRoutineError(e?.message || String(e));
        } finally {
            setSubmitLoading(false);
        }
    }, [name, gatherResource, durationMinutes, fetchRoutine]);

    return (
        <div className="page">
            <div className="stack">
                {/* Current routine section */}
                <section className="panel">
                    <div className="panel-inner stack">
                        <div className="row wrap">
                            <h3 className="panel-title"><Icon name="controls"/>Routines</h3>
                            {(loadingRoutine || submitLoading) && (
                                <span className="row" style={{gap: 6}}><span className="loader"/> Working...</span>
                            )}
                        </div>

                        <CharacterSelect value={name} onChange={setName}/>

                        <div className="row wrap fill">
                            <button className="btn btn-primary" onClick={fetchRoutine}
                                    disabled={!name || loadingRoutine}>
                                <Icon name="download"/>Get Current Routine
                            </button>
                        </div>

                        {routineError && (
                            <div className="helper" style={{color: '#ef476f'}}>Error: {routineError}</div>
                        )}

                        <div className="stack">
                            <label className="input-label">Current routine JSON</label>
                            {currentRoutine ? (
                                <JsonView data={currentRoutine}/>
                            ) : (
                                <div
                                    className="helper">{name ? 'No routine for this character.' : 'Select a character to view routine.'}</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Gather routine section */}
                <section className="panel">
                    <div className="panel-inner stack">
                        <h3 className="panel-title"><Icon name="leaf"/>Gather Routine</h3>

                        <div className="row equal">
                            <div className="stack">
                                <label className="input-label" htmlFor="gatherResource">Gather Resource</label>
                                <select
                                    id="gatherResource"
                                    className="input"
                                    value={gatherResource}
                                    onChange={(e) => setGatherResource(e.target.value as GatherResource)}
                                >
                                    <option value="COPPER">COPPER</option>
                                    <option value="GOLD">GOLD</option>
                                    <option value="ASH_TREE">ASH_TREE</option>
                                </select>
                            </div>

                            <div className="stack">
                                <label className="input-label" htmlFor="durationMinutes">Duration (minutes,
                                    optional)</label>
                                <input
                                    id="durationMinutes"
                                    className="input"
                                    type="number"
                                    min={0}
                                    value={durationMinutes}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setDurationMinutes(v === '' ? '' : Number(v));
                                    }}
                                    placeholder="e.g. 15"
                                />
                            </div>
                        </div>

                        <div className="row wrap fill">
                            <button className="btn btn-accent" onClick={doStartGather} disabled={!isReady}>
                                <Icon name="leaf"/>Start Gather
                            </button>
                        </div>

                        {submitMsg && <div className="helper" style={{color: '#72efdd'}}>{submitMsg}</div>}
                    </div>
                </section>
            </div>
        </div>
    );
}
