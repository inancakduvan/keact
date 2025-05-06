import { useSyncExternalStore } from 'react';

export interface KeactTypeRegistry {}

const store = new Map<
  string,
  { value: any; listeners: Set<() => void>;}
>();

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
    }
  };

  return [value, setValue];
}
