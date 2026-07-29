// IndexedDB storage utility for large audio history items and custom voice clones
const DB_NAME = 'BhashaVoiceDB';
const DB_VERSION = 1;
const HISTORY_STORE = 'audio_history';
const CLONES_STORE = 'custom_clones';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CLONES_STORE)) {
        db.createObjectStore(CLONES_STORE, { keyPath: 'id' });
      }
    };
  });
}

export async function getStoredHistory(): Promise<any[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(HISTORY_STORE, 'readonly');
      const store = tx.objectStore(HISTORY_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        // Sort newest first
        results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(results);
      };
      req.onerror = () => resolve(getFallbackHistory());
    });
  } catch (e) {
    return getFallbackHistory();
  }
}

function getFallbackHistory(): any[] {
  try {
    const saved = localStorage.getItem('bhasha_voice_history_v1');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveStoredHistory(items: any[]): Promise<void> {
  // 1. Persist full audio objects into IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(HISTORY_STORE, 'readwrite');
    const store = tx.objectStore(HISTORY_STORE);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    console.warn('IndexedDB history write notice:', e);
  }

  // 2. Safe sync to localStorage with quota protection
  try {
    const trimmed = items.slice(0, 10);
    localStorage.setItem('bhasha_voice_history_v1', JSON.stringify(trimmed));
  } catch (quotaErr) {
    try {
      // Keep recent items, remove heavy audioBase64 from older ones for localStorage
      const minimalItems = items.slice(0, 6).map((item, idx) => {
        if (idx > 1) {
          return { ...item, audioBase64: '' };
        }
        return item;
      });
      localStorage.setItem('bhasha_voice_history_v1', JSON.stringify(minimalItems));
    } catch {
      // If localStorage is completely full, clean up history key safely without crashing
      try {
        localStorage.removeItem('bhasha_voice_history_v1');
      } catch {}
    }
  }
}

export async function getStoredClones(): Promise<any[]> {
  let localClones: any[] = [];
  try {
    const db = await openDB();
    localClones = await new Promise((resolve) => {
      const tx = db.transaction(CLONES_STORE, 'readonly');
      const store = tx.objectStore(CLONES_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve(getFallbackClones());
    });
  } catch (e) {
    localClones = getFallbackClones();
  }

  // Also try fetching permanent server clones
  try {
    const res = await fetch('/api/clones');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.clones)) {
        const serverClones: any[] = data.clones;
        // Merge server and local clones by ID
        const cloneMap = new Map<string, any>();
        for (const clone of localClones) {
          if (clone.id) cloneMap.set(clone.id, clone);
        }
        for (const clone of serverClones) {
          if (clone.id) cloneMap.set(clone.id, clone);
        }
        const merged = Array.from(cloneMap.values());
        merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        
        // Update local DB asynchronously with merged set
        saveStoredClonesLocal(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn('Server clone fetch fallback to local:', err);
  }

  localClones.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return localClones;
}

function getFallbackClones(): any[] {
  try {
    const saved = localStorage.getItem('bhasha_custom_voice_clones_v1');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

async function saveStoredClonesLocal(items: any[]): Promise<void> {
  // 1. IndexedDB write
  try {
    const db = await openDB();
    const tx = db.transaction(CLONES_STORE, 'readwrite');
    const store = tx.objectStore(CLONES_STORE);
    store.clear();
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    console.warn('IndexedDB clones write notice:', e);
  }

  // 2. LocalStorage fallback
  try {
    localStorage.setItem('bhasha_custom_voice_clones_v1', JSON.stringify(items));
  } catch (quotaErr) {
    try {
      const lightweightClones = items.map((clone) => ({
        ...clone,
        sampleAudioBase64: undefined,
      }));
      localStorage.setItem('bhasha_custom_voice_clones_v1', JSON.stringify(lightweightClones));
    } catch {
      console.warn('LocalStorage full; clones preserved in IndexedDB/Server.');
    }
  }
}

export async function saveStoredClones(items: any[]): Promise<void> {
  // Save locally
  await saveStoredClonesLocal(items);

  // Sync to server disk permanently
  try {
    await fetch('/api/clones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clones: items }),
    });
  } catch (e) {
    console.warn('Server clone sync notice:', e);
  }
}
