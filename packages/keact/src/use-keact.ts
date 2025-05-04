// keact.ts
import { useSyncExternalStore } from 'react';

export interface KeactTypeRegistry {};

type ValueOf<K extends string> =
  K extends keyof KeactTypeRegistry ? KeactTypeRegistry[K] : unknown;

const store = new Map<string, { value: any; listeners: Set<() => void> }>();

export function useKeact<K extends string, T = ValueOf<K>>(
  key: K,
  initializer?: () => T
): [T, (v: T) => void] {
  const isInitialized = store.has(key);

  if (!isInitialized) {
    const initialValue = initializer?.();
    store.set(key, {
      value: initialValue,
      listeners: new Set(),
    });
  }

  const getSnapshot = () => store.get(key)!.value as T;
  const subscribe = (callback: () => void) => {
    const entry = store.get(key);
    entry!.listeners.add(callback);
    return () => entry!.listeners.delete(callback);
  };

  const value = useSyncExternalStore(subscribe, getSnapshot);
  const setValue = (v: T) => {
    const entry = store.get(key);
    if (entry) {
      entry.value = v;
      entry.listeners.forEach((cb) => cb());
    }
  };

  return [value, setValue];
}
