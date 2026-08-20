import { get, set, del } from 'idb-keyval'
import type { StateStorage } from 'zustand/middleware'

/** Bewaart de zustand-store in IndexedDB (via idb-keyval) i.p.v. localStorage, zodat foto's als data-URL ook offline zonder geheugendruk bewaard blijven. */
export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) ?? null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  }
}
