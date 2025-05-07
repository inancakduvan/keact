import { useSyncExternalStore } from 'react';

export interface KeactTypeRegistry {}

const store = new Map<
  string,
  { value: any; listeners: Set<() => void>;}
>();

const exposeStoreToWindow = () => {
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_STORE__ = store;
  }
}

exposeStoreToWindow();

export function useKeact<K extends keyof KeactTypeRegistry>(
  key: K,
  initializer?: () => KeactTypeRegistry[K]
): [KeactTypeRegistry[K], (v: KeactTypeRegistry[K]) => void] {
  const isInitialized = store.has(key as string);

  if (!isInitialized) {
    const initialValue = initializer?.();
    store.set(key as string, {
      value: initialValue,
      listeners: new Set(),
    });
  }

  const getSnapshot = () => {
    const entry = store.get(key as string);
    return entry?.value as KeactTypeRegistry[K];
  };

  const subscribe = (callback: () => void) => {
    const entry = store.get(key as string);
    entry?.listeners.add(callback);

    return () => {
      entry?.listeners.delete(callback);
    };
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = (v: KeactTypeRegistry[K]) => {
    const entry = store.get(key as string);
    if (entry) {
      entry.value = v;
      entry.listeners.forEach((cb) => cb());

      exposeStoreToWindow();
    }
  };

  return [value, setValue];
}
