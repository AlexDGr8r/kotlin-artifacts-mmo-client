export type Destination = { x: number; y: number };

export async function getCharacter(name: string) {
    const res = await fetch(`/character/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error(`Failed to fetch character: ${res.status}`);
    return res.json();
}

let _allCharactersPromise: Promise<any> | null = null;

export async function getAllCharacters(forceReload: boolean = false) {
    if (!_allCharactersPromise || forceReload) {
        _allCharactersPromise = (async () => {
            const res = await fetch(`/character/all`);
            if (!res.ok) throw new Error(`Failed to fetch characters: ${res.status}`);
            return res.json();
        })().catch(err => {
            // Reset cache on failure so a future call can retry
            _allCharactersPromise = null;
            throw err;
        });
    }
    return _allCharactersPromise;
}

export async function refreshCharacter(name: string) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/refresh`);
    if (!res.ok) throw new Error(`Failed to refresh character: ${res.status}`);
    return res.json();
}

export async function fight(name: string, rest: boolean = true) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/fight?rest=${rest ? 'true' : 'false'}`);
    if (!res.ok) throw new Error(`Failed to fight: ${res.status}`);
}

export async function rest(name: string) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/rest`);
    if (!res.ok) throw new Error(`Failed to rest: ${res.status}`);
    return res.json();
}

export async function move(name: string, destination: Destination) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/move`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(destination),
    });
    if (!res.ok) throw new Error(`Failed to move: ${res.status}`);
    return res.json();
}

export async function cooldown(name: string) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/cooldown`);
    if (!res.ok) throw new Error(`Failed to get cooldown: ${res.status}`);
    return res.text();
}

export async function gather(name: string) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/gather`);
    if (!res.ok) throw new Error(`Failed to gather: ${res.status}`);
    return res.json()
}

export async function gatherAt(name: string, destination: Destination) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/gather`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(destination),
    });
    if (!res.ok) throw new Error(`Failed to gather: ${res.status}`);
}

export type Equip = { slot: string; code: string };

export async function equip(name: string, equip: Equip) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/equip`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(equip),
    });
    if (!res.ok) throw new Error(`Failed to equip: ${res.status}`);
    return res.json();
}

export type Unequip = { slot: string };

export async function unequip(name: string, unequip: Unequip) {
    const res = await fetch(`/character/${encodeURIComponent(name)}/unequip`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(unequip),
    });
    if (!res.ok) throw new Error(`Failed to unequip: ${res.status}`);
    return res.json();
}

export async function getSlots(): Promise<string[]> {
    const res = await fetch(`/character/slots`);
    if (!res.ok) throw new Error(`Failed to fetch slots: ${res.status}`);
    return res.json();
}

export type InventorySlot = { character?: string; slot: number; code: string; quantity: number; id?: number };

export async function getInventory(name: string): Promise<Record<number, InventorySlot>> {
    const res = await fetch(`/character/${encodeURIComponent(name)}/inventory`);
    if (!res.ok) throw new Error(`Failed to fetch inventory: ${res.status}`);
    return res.json();
}
