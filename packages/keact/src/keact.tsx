import React, { useSyncExternalStore, useRef } from "react";

// ========== TYPE DEFINITIONS ==========
export interface KeactTypeRegistry {}

// ========== INTERNAL STATE ==========
const globalStore: Record<string, any> = {};
const globalListeners: Record<string, Set<() => void>> = {};
// Selectors can read any key, so they subscribe here and are notified on any write.
const globalSubscribers: Set<() => void> = new Set();

// Notify both the per-key listeners and every selector subscriber.
const notify = (key: string) => {
  globalListeners[key]?.forEach((l) => l());
  globalSubscribers.forEach((l) => l());
};

// Shallow comparison so selectors returning a fresh object/array each call
// (e.g. `s => ({ a: s.a })`) don't break useSyncExternalStore's snapshot caching.
const shallowEqual = (a: any, b: any): boolean => {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (k) => Object.prototype.hasOwnProperty.call(b, k) && Object.is(a[k], b[k])
  );
};

const exposeStoreToWindow = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_GLOBAL_STORE__ = globalStore;
  }
};
exposeStoreToWindow();

// ========== TYPE-SAFE KEACT FACTORY ==========
export function typeSafeKeact<T extends Record<string, any>>() {
  function useTypedKeact<K extends keyof T>(
    key: K,
    options?: { initialValue?: T[K] }
  ): [T[K], (value: T[K] | ((prev: T[K]) => T[K])) => void];
  
  function useTypedKeact<R>(
    selector: (state: T) => R,
    options?: { initialValue?: any }
  ): [R, (value: R | ((prev: R) => R)) => void];
  
  function useTypedKeact<K extends keyof T, R>(
    keyOrSelector: K | ((state: T) => R),
    options?: { initialValue?: any }
  ): [any, (value: any) => void] {
    return useKeact(keyOrSelector as any, options);
  }
  
  return useTypedKeact;
}

// ========== ORIGINAL useKeact HOOK ==========
export function useKeact<K extends keyof KeactTypeRegistry>(
  key: K,
  options?: { initialValue?: KeactTypeRegistry[K] }
): [KeactTypeRegistry[K], (value: KeactTypeRegistry[K]) => void];

export function useKeact(
  key: string,
  options?: { initialValue?: any }
): [any, (value: any) => void];

export function useKeact<T>(
  selector: (state: Record<string, any>) => T,
  options?: { initialValue?: any }
): [T, (value: T | ((prev: T) => T)) => void];

export function useKeact(
  keyOrSelector: string | ((state: Record<string, any>) => any),
  options?: { initialValue?: any }
): [any, (value: any) => void] {
  const isSelector = typeof keyOrSelector === 'function';
  const key = isSelector ? '__SELECTOR__' : keyOrSelector as string;

  // Per-instance cache of the last selector result so we can return a stable
  // reference while the computed value is unchanged.
  const cacheRef = useRef<{ value: any; hasValue: boolean }>({
    value: undefined,
    hasValue: false,
  });

  const subscribe = (callback: () => void) => {
    if (isSelector) {
      // Subscribe to every write (including future keys), not just keys that
      // happen to exist at subscribe time.
      globalSubscribers.add(callback);
      return () => {
        globalSubscribers.delete(callback);
      };
    } else {
      globalListeners[key] ||= new Set();
      globalListeners[key].add(callback);
      return () => {
        globalListeners[key]?.delete(callback);
      };
    }
  };

  const getSnapshot = () => {
    if (isSelector) {
      const next = (keyOrSelector as Function)(globalStore);
      // Only adopt the new value if it actually changed; otherwise keep the
      // cached reference so useSyncExternalStore doesn't loop / warn.
      if (!cacheRef.current.hasValue || !shallowEqual(cacheRef.current.value, next)) {
        cacheRef.current = { value: next, hasValue: true };
      }
      return cacheRef.current.value;
    } else {
      if (!(key in globalStore) && options?.initialValue !== undefined) {
        globalStore[key] = options.initialValue;
      }
      return globalStore[key];
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = (val: any) => {
    if (isSelector) {
      throw new Error('Cannot set value when using selector. Use direct key access instead.');
    }

    const next = typeof val === "function" ? val(value) : val;
    globalStore[key] = next;
    notify(key);
    exposeStoreToWindow();
  };

  return [value, setValue];
}