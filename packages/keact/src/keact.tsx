import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Type definition
export interface KeactTypeRegistry {
  
}

// Type helpers
type GlobalKeys = {
  [K in keyof KeactTypeRegistry]: KeactTypeRegistry[K] extends object ? never : K;
}[keyof KeactTypeRegistry];

type ContextKeys = Exclude<keyof KeactTypeRegistry, GlobalKeys>;

// Global store and listeners
const globalStore: Record<string, any> = {};
const listeners: Record<string, Set<() => void>> = {};

const exposeStoreToWindow = () => {
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_STORE__ = globalStore;
  }
}

exposeStoreToWindow();

// Context-specific stores and listeners
const contextStores: Record<string, Record<string, any>> = {};
const contextListeners: Record<string, Record<string, Set<() => void>>> = {};

// Context Provider
const KeactContextValues = createContext<string | null>(null);

export function KeactContext({ name, children }: { name: string; children: ReactNode }) {
  if (!contextStores[name]) {
    contextStores[name] = {};
    contextListeners[name] = {};
  }

  return (
    <KeactContextValues.Provider value={name}>
      {children}
    </KeactContextValues.Provider>
  );
}

// useKeact hook
export function useKeact<K extends GlobalKeys>(
  key: K,
  options?: { initialValue?: KeactTypeRegistry[K]; context?: undefined }
): [KeactTypeRegistry[K], (value: KeactTypeRegistry[K]) => void];

export function useKeact<C extends ContextKeys, K extends keyof KeactTypeRegistry[C] & string>(
  key: K,
  options: { initialValue?: KeactTypeRegistry[C][K]; context: C }
): [KeactTypeRegistry[C][K], (value: KeactTypeRegistry[C][K]) => void];

export function useKeact(
  key: string,
  options?: { initialValue?: any; context?: string }
): [any, (value: any) => void] {
  const contextValue = useContext(KeactContextValues);
  const [, forceUpdate] = useState({});

  const isContextBased = options?.context !== undefined;
  const contextName = options?.context || contextValue;

  useEffect(() => {
    if (isContextBased && contextName) {
      if (!contextStores[contextName]) {
        contextStores[contextName] = {};
        contextListeners[contextName] = {};
      }
      if (!contextListeners[contextName][key]) {
        contextListeners[contextName][key] = new Set();
      }
      if (contextStores[contextName][key] === undefined && options?.initialValue !== undefined) {
        contextStores[contextName][key] = options.initialValue;
      }
      const listener = () => forceUpdate({});
      contextListeners[contextName][key].add(listener);
      return () => {
        contextListeners[contextName][key].delete(listener);
      };
    } else {
      if (!listeners[key]) {
        listeners[key] = new Set();
      }
      if (globalStore[key] === undefined && options?.initialValue !== undefined) {
        globalStore[key] = options.initialValue;
      }
      const listener = () => forceUpdate({});
      listeners[key].add(listener);
      return () => {
        listeners[key].delete(listener);
      };
    }
  }, [key, contextName, isContextBased]);

  const getValue = () => {
    if (isContextBased && contextName) {
      return contextStores[contextName]?.[key] !== undefined
        ? contextStores[contextName][key]
        : options?.initialValue;
    }
    return globalStore[key] !== undefined ? globalStore[key] : options?.initialValue;
  };

  const setValue = (newValue: any) => {
    if (isContextBased && contextName) {
      const nextValue = typeof newValue === 'function'
        ? newValue(contextStores[contextName][key])
        : newValue;
      contextStores[contextName][key] = nextValue;
      contextListeners[contextName]?.[key]?.forEach(fn => fn());
    } else {
      const nextValue = typeof newValue === 'function'
        ? newValue(globalStore[key])
        : newValue;
      globalStore[key] = nextValue;
      listeners[key]?.forEach(fn => fn());
    }

    exposeStoreToWindow();
  };

  return [getValue(), setValue];
}

// Reset functions
export function resetKeact(): void {
  Object.keys(globalStore).forEach(key => delete globalStore[key]);
  Object.keys(listeners).forEach(key => listeners[key].clear());
}

export function resetKeactContext(contextName: string): void {
  delete contextStores[contextName];
  delete contextListeners[contextName];
}
