import React, { useSyncExternalStore, useRef, useCallback } from "react";

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
  
  // Selectors are read-only: they derive a value and cannot set it, so the
  // tuple intentionally has no setter (calling one would throw at runtime).
  function useTypedKeact<R>(
    selector: (state: T) => R
  ): [R];

  function useTypedKeact<K extends keyof T, R>(
    keyOrSelector: K | ((state: T) => R),
    options?: { initialValue?: any }
  ): any {
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

// Selectors are read-only: the tuple has no setter on purpose.
export function useKeact<T>(
  selector: (state: Record<string, any>) => T
): [T];

export function useKeact(
  keyOrSelector: string | ((state: Record<string, any>) => any),
  options?: { initialValue?: any }
): any {
  const isSelector = typeof keyOrSelector === 'function';
  const key = isSelector ? '__SELECTOR__' : keyOrSelector as string;

  // Per-instance cache of the last selector result so we can return a stable
  // reference while the computed value is unchanged.
  const cacheRef = useRef<{ value: any; hasValue: boolean }>({
    value: undefined,
    hasValue: false,
  });

  // Stable subscribe identity so useSyncExternalStore doesn't unsubscribe +
  // resubscribe on every render.
  const subscribe = useCallback((callback: () => void) => {
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
        const set = globalListeners[key];
        if (!set) return;
        set.delete(callback);
        // Drop empty listener sets so they don't accumulate over the app's life.
        if (set.size === 0) delete globalListeners[key];
      };
    }
  }, [key, isSelector]);

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

  // Stable setValue identity; reads the current value from the store rather
  // than closing over `value`, so it never goes stale and never re-creates.
  const setValue = useCallback((val: any) => {
    if (isSelector) {
      throw new Error('Cannot set value when using selector. Use direct key access instead.');
    }

    const prev = globalStore[key];
    const next = typeof val === "function" ? val(prev) : val;
    // Skip work and re-renders when the value is unchanged.
    if (Object.is(prev, next)) return;

    globalStore[key] = next;
    notify(key);
    exposeStoreToWindow();
  }, [key, isSelector]);

  return [value, setValue];
}