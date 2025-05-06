import { useSyncExternalStore } from 'react';

export interface KeactTypeRegistry {}

const store = new Map<
  string,
  { value: any; listeners: Set<() => void>; timeout?: NodeJS.Timeout }
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

      // If there are no listeners left, start a delayed flush to free memory.
      if (entry && entry.listeners.size === 0) {
        entry.timeout = setTimeout(() => {
          store.delete(key as string);
        }, 10_000); // will be removed after 10 seconds
      }
    };
  };

  const value = useSyncExternalStore(subscribe, getSnapshot);

  const setValue = (v: KeactTypeRegistry[K]) => {
    const entry = store.get(key as string);
    if (entry) {
      // If a timeout has been set for deletion before, cancel it.
      if (entry.timeout) {
        clearTimeout(entry.timeout);
        delete entry.timeout;
      }

      entry.value = v;
      entry.listeners.forEach((cb) => cb());
    }
  };

  return [value, setValue];
}
