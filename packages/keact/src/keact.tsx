import React, { useSyncExternalStore } from "react";

// ========== TYPE DEFINITIONS ==========
export interface KeactTypeRegistry {}

// ========== INTERNAL STATE ==========
const globalStore: Record<string, any> = {};
const globalListeners: Record<string, Set<() => void>> = {};

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
  
  const subscribe = (callback: () => void) => {
    if (isSelector) {
      // For selectors, subscribe to all changes in global store
      const allKeys = Object.keys(globalStore);
      allKeys.forEach(k => {
        globalListeners[k] ||= new Set();
        globalListeners[k].add(callback);
      });
      return () => {
        allKeys.forEach(k => {
          globalListeners[k]?.delete(callback);
        });
      };
    } else {
      globalListeners[key] ||= new Set();
      globalListeners[key].add(callback);
      return () => globalListeners[key].delete(callback);
    }
  };

  const getSnapshot = () => {
    if (isSelector) {
      return (keyOrSelector as Function)(globalStore);
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
    globalListeners[key]?.forEach((l) => l());
    exposeStoreToWindow();
  };

  return [value, setValue];
}