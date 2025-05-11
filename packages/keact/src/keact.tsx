import React, {
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  ReactNode
} from 'react';

// Type definitions
export interface KeactTypeRegistry {}
export interface KeactContextTypeRegistry {}

// Type helpers
type KeyofKeactTypeRegistry = keyof KeactTypeRegistry;
type ValueOfKeactTypeRegistry<K extends KeyofKeactTypeRegistry> = K extends keyof KeactTypeRegistry
  ? KeactTypeRegistry[K]
  : unknown;

// Stores
const globalStore: Record<string, any> = {};
const globalListeners: Record<string, Set<() => void>> = {};

const contextStores: Record<string, Record<string, any>> = {};
const contextListeners: Record<string, Record<string, Set<() => void>>> = {};

const exposeStoreToWindow = () => {
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_GLOBAL_STORE__ = globalStore;
    (window as any).__KEACT_CONTEXT_STORES__ = contextStores;
  }
}

exposeStoreToWindow();

// Context Name Provider
const KeactContextValues = createContext<string | null>(null);

type KeactContextProps = {
  name: string;
  children: ReactNode;
};

export function KeactContext({ name, children }: KeactContextProps) {
  if (!contextStores[name]) contextStores[name] = {};
  if (!contextListeners[name]) contextListeners[name] = {};

  return (
    <KeactContextValues.Provider value={name}>
      {children}
    </KeactContextValues.Provider>
  );
}

// Main Hook
type KeactOptions<T> = {
  initialValue?: T;
  context?: string;
};

export function useKeact<K extends string>(
  key: K extends KeyofKeactTypeRegistry ? K : string,
  options?: KeactOptions<K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any>
): [
  K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any,
  (value: K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any) => void
] {
  const declaredContext = options?.context;
  const activeContext = useContext(KeactContextValues);

  const isContextBased = declaredContext !== undefined || activeContext !== null;
  const contextName = declaredContext ?? activeContext;

  // Enforce: if context is provided, must be inside corresponding Provider
  if (declaredContext && declaredContext !== activeContext) {
    throw new Error(
      `[Keact] useKeact(key: "${key}") was called with context "${declaredContext}" outside of its corresponding <KeactContext name="${declaredContext}">`
    );
  }

  const store = isContextBased && contextName
    ? (contextStores[contextName] ??= {})
    : globalStore;

  const listeners = isContextBased && contextName
    ? (contextListeners[contextName] ??= {})[key] ??= new Set()
    : (globalListeners[key] ??= new Set());

  // Initialize default value
  const initializedRef = useRef(false);
  if (!initializedRef.current && store[key] === undefined && options?.initialValue !== undefined) {
    store[key] = options.initialValue;
    initializedRef.current = true;
  }

  const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  };

  const getSnapshot = () => store[key];

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = (newValue: any) => {
    const nextValue = typeof newValue === 'function' ? newValue(store[key]) : newValue;
    store[key] = nextValue;
    listeners.forEach(fn => fn());

    exposeStoreToWindow();
  };

  return [value, setValue];
}

// Utility: Global store getters/setters
export function getKeactValue<K extends KeyofKeactTypeRegistry>(key: K): ValueOfKeactTypeRegistry<K> {
  return globalStore[key];
}

export function setKeactValue<K extends KeyofKeactTypeRegistry>(key: K, value: ValueOfKeactTypeRegistry<K>) {
  globalStore[key] = typeof value === 'function' ? value(globalStore[key]) : value;
  globalListeners[key]?.forEach(fn => fn());
}

// Utility: Context store getters/setters
export function getKeactContextValue<C extends string, K extends string>(contextName: C, key: K) {
  return contextStores[contextName]?.[key];
}

export function setKeactContextValue<C extends string, K extends string>(
  contextName: C,
  key: K,
  value: any
) {
  const store = contextStores[contextName] ??= {};
  store[key] = typeof value === 'function' ? value(store[key]) : value;
  contextListeners[contextName]?.[key]?.forEach(fn => fn());
}

// Reset functions for test/debug
export function resetKeact(): void {
  Object.keys(globalStore).forEach(key => delete globalStore[key]);
  Object.keys(globalListeners).forEach(key => globalListeners[key].clear());
}

export function resetKeactContext(contextName: string): void {
  delete contextStores[contextName];
  delete contextListeners[contextName];
}
