import { useSyncExternalStore } from 'react';

export interface KeactTypeRegistry {};

type Listener = () => void;

const store = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

const exposeStoreToWindow = () => {
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_STORE__ = store;
  }
}

exposeStoreToWindow();

function subscribe(key: string, callback: Listener): () => void {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  return () => {
    listeners.get(key)!.delete(callback);
    if (listeners.get(key)!.size === 0) {
      listeners.delete(key);
    }
  };
}

function getSnapshot<T>(key: string): T {
  return store.get(key) as T;
}

export function useKeact<K extends keyof KeactTypeRegistry>(
  key: K,
  initialValue?: KeactTypeRegistry[K]
): [KeactTypeRegistry[K], (val: KeactTypeRegistry[K]) => void] {
  if (!store.has(key) && initialValue !== undefined) {
    store.set(key as string, initialValue);
  }

  const value = useSyncExternalStore(
    (cb) => subscribe(key as string, cb),
    () => getSnapshot<KeactTypeRegistry[K]>(key as string),
    () => getSnapshot<KeactTypeRegistry[K]>(key as string)
  );

  const setValue = (val: KeactTypeRegistry[K]) => {
    store.set(key as string, val);
    listeners.get(key as string)?.forEach((cb) => cb());

    exposeStoreToWindow();
  };

  return [value, setValue];
}
