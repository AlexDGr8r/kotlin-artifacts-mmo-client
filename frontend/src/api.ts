export type Destination = { x: number; y: number };

export async function getCharacter(name: string) {
  const res = await fetch(`/character/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error(`Failed to fetch character: ${res.status}`);
  return res.json();
}

export async function refreshCharacter(name: string) {
  const res = await fetch(`/character/${encodeURIComponent(name)}/refresh`);
  if (!res.ok) throw new Error(`Failed to refresh character: ${res.status}`);
}

export async function fight(name: string, rest: boolean = true) {
  const res = await fetch(`/character/${encodeURIComponent(name)}/fight?rest=${rest ? 'true' : 'false'}`);
  if (!res.ok) throw new Error(`Failed to fight: ${res.status}`);
}

export async function rest(name: string) {
  const res = await fetch(`/character/${encodeURIComponent(name)}/rest`);
  if (!res.ok) throw new Error(`Failed to rest: ${res.status}`);
}

export async function move(name: string, destination: Destination) {
  const res = await fetch(`/character/${encodeURIComponent(name)}/move`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(destination),
  });
  if (!res.ok) throw new Error(`Failed to move: ${res.status}`);
}

export async function cooldown(name: string) {
  const res = await fetch(`/character/${encodeURIComponent(name)}/cooldown`);
  if (!res.ok) throw new Error(`Failed to get cooldown: ${res.status}`);
  return res.text();
}
