import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useSyncExternalStore,
} from "react";

// ========== TYPE DEFINITIONS ==========
export interface KeactTypeRegistry {}
export interface KeactContextTypeRegistry {}

// ========== INTERNAL STATE ==========
const globalStore: Record<string, any> = {};
const globalListeners: Record<string, Set<() => void>> = {};

const contextStores: Record<string, Record<string, any>> = {};
const contextListeners: Record<string, Record<string, Set<() => void>>> = {};

const exposeStoreToWindow = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_GLOBAL_STORE__ = globalStore;
    (window as any).__KEACT_CONTEXT_STORES__ = contextStores;
  }
};
exposeStoreToWindow();

// ========== CONTEXT HANDLING ==========
const KeactCurrentContext = createContext<string | null>(null);

export function KeactContext({ name, children }: { name: string; children: ReactNode }) {
  const initialized = useRef(false);
  if (!initialized.current) {
    contextStores[name] ||= {};
    contextListeners[name] ||= {};
    initialized.current = true;
  }
  return <KeactCurrentContext.Provider value={name}>{children}</KeactCurrentContext.Provider>;
}

// ========== useKeact HOOK with overloads ==========

// Global state version
export function useKeact<K extends keyof KeactTypeRegistry>(
  key: K,
  options?: { initialValue?: KeactTypeRegistry[K] }
): [KeactTypeRegistry[K], (value: KeactTypeRegistry[K]) => void];

export function useKeact(
  key: string,
  options?: { initialValue?: any }
): [any, (value: any) => void];

export function useKeact<
  C extends keyof KeactContextTypeRegistry,
  K extends keyof KeactContextTypeRegistry[C]
>(
  key: K,
  options: { context: C; initialValue?: KeactContextTypeRegistry[C][K] }
): [KeactContextTypeRegistry[C][K], (value: KeactContextTypeRegistry[C][K]) => void];

export function useKeact(
  key: string,
  options: { context: string; initialValue?: any }
): [any, (value: any) => void];


// Unified implementation
export function useKeact(
  key: string,
  options?: {
    initialValue?: any;
    context?: string;
  }
): [any, (value: any) => void] {
  const contextFromTree = useContext(KeactCurrentContext);
  const context = options?.context ?? null;
  const isContext = context !== null;

  if (isContext && contextFromTree !== context) {
    throw new Error(`Cannot access Keact context "${context}" outside of its provider.`);
  }

  const subscribe = (callback: () => void) => {
    if (isContext) {
      contextListeners[context] ||= {};
      contextListeners[context][key] ||= new Set();
      contextListeners[context][key].add(callback);
      return () => contextListeners[context][key].delete(callback);
    } else {
      globalListeners[key] ||= new Set();
      globalListeners[key].add(callback);
      return () => globalListeners[key].delete(callback);
    }
  };

  const getSnapshot = () => {
    if (isContext) {
      contextStores[context] ||= {};
      if (!(key in contextStores[context]) && options?.initialValue !== undefined) {
        contextStores[context][key] = options.initialValue;
      }
      return contextStores[context][key];
    } else {
      if (!(key in globalStore) && options?.initialValue !== undefined) {
        globalStore[key] = options.initialValue;
      }
      return globalStore[key];
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = (val: any) => {
    const next = typeof val === "function" ? val(value) : val;

    if (isContext) {
      contextStores[context] ||= {};
      contextStores[context][key] = next;
      contextListeners[context]?.[key]?.forEach((l) => l());
    } else {
      globalStore[key] = next;
      globalListeners[key]?.forEach((l) => l());
    }

    exposeStoreToWindow();
  };

  return [value, setValue];
}
