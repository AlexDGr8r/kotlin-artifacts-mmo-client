import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {cooldown, Destination, fight, getCharacter, move, refreshCharacter, rest} from './api';

function JsonView({ data }: { data: unknown }) {
  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  return <pre className="json">{text}</pre>;
}

export default function App() {
  const [name, setName] = useState<string>('');
  const [character, setCharacter] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownText, setCooldownText] = useState<string>('');
  const [dest, setDest] = useState<Destination>({ x: 0, y: 0 });

  const load = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCharacter(name);
      setCharacter(data ?? null);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [name]);

  const doRefresh = useCallback(async () => {
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      await refreshCharacter(name);
      await load();
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
      await rest(name);
      await load();
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
      await move(name, dest);
      await load();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [name, dest, load]);

  const checkCooldown = useCallback(async () => {
    if (!name) return;
    setError(null);
    try {
      const text = await cooldown(name);
      setCooldownText(text);
    } catch (e: any) {
      setError(e.message || String(e));
    }
  }, [name]);

  useEffect(() => {
    setCharacter(null);
    setCooldownText('');
  }, [name]);

  const isReady = !!name && !loading;

  return (
    <div className="app-shell">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-badge" />
            <div className="brand-title">Artifacts MMO Client</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {cooldownText ? (
              <span className="badge badge-accent" title="Cooldown status">{cooldownText}</span>
            ) : (
              <span className="badge">Ready</span>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <div className="grid">
          {/* Controls panel */}
          <section className="panel">
            <div className="panel-inner stack">
              <h3 className="panel-title">Controls</h3>

              <div className="stack">
                <label className="input-label" htmlFor="charName">Character name</label>
                <input
                  id="charName"
                  className="input"
                  placeholder="e.g. MyHero123"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="row wrap">
                <button className="btn btn-accent" onClick={load} disabled={!isReady}>Load</button>
                <button className="btn btn-primary" onClick={doRefresh} disabled={!isReady}>Refresh</button>
                <button className="btn" onClick={checkCooldown} disabled={!isReady}>Check Cooldown</button>
              </div>

              <div className="row wrap">
                <button className="btn" onClick={doRest} disabled={!isReady}>Rest</button>
                <button className="btn btn-danger" onClick={doFight} disabled={!isReady}>Fight</button>
                {loading && <span className="row" style={{ gap: 6 }}><span className="loader" /> Loading...</span>}
              </div>

              <div className="stack">
                <label className="input-label">Move to coordinates</label>
                <div className="row wrap">
                  <input
                    className="number-input"
                    type="number"
                    value={dest.x}
                    onChange={(e) => setDest({ ...dest, x: Number(e.target.value) })}
                    placeholder="X"
                  />
                  <input
                    className="number-input"
                    type="number"
                    value={dest.y}
                    onChange={(e) => setDest({ ...dest, y: Number(e.target.value) })}
                    placeholder="Y"
                  />
                  <button className="btn" onClick={doMove} disabled={!isReady}>Move</button>
                </div>
              </div>

              {error && <div className="helper" style={{ color: '#ef476f' }}>Error: {error}</div>}
              {!name && <div className="helper">Enter a character name to begin.</div>}
            </div>
          </section>

          {/* Data panel */}
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Character</h3>
              {character && (
                <div className="row wrap" style={{ gap: 8 }}>
                  <span className="badge">Lvl {character.level ?? '-'} </span>
                  <span className="badge">HP {character.hp ?? '-'}/{character.max_hp ?? '-'}</span>
                  <span className="badge">Gold {character.gold ?? '-'}</span>
                  <span className="badge">Pos {character.x ?? '-'},{character.y ?? '-'}</span>
                </div>
              )}
            </div>
            <div className="card-body">
              {character ? (
                <JsonView data={character} />
              ) : (
                <div className="helper">No character loaded.</div>
              )}
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
