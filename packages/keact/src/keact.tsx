import React, {
  createContext,
  useContext,
  useRef,
  ReactNode,
  useSyncExternalStore,
} from "react";

// ========== TYPE DEFINITIONS ==========
export interface KeactTypeRegistry { }
export interface KeactContextTypeRegistry { }

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

// ========== useKeact HOOK ==========
export function useKeact<
  K extends string,
  C extends string | undefined = undefined
>(
  key: C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
    ? K
    : never
    : K,
  options?: {
    initialValue?: C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
    ? KeactContextTypeRegistry[C][K]
    : any
    : K extends keyof KeactTypeRegistry
    ? KeactTypeRegistry[K]
    : any;
    context?: C;
  }
): [
    C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
    ? KeactContextTypeRegistry[C][K]
    : any
    : K extends keyof KeactTypeRegistry
    ? KeactTypeRegistry[K]
    : any,
    (
      value: C extends keyof KeactContextTypeRegistry
        ? K extends keyof KeactContextTypeRegistry[C]
        ? KeactContextTypeRegistry[C][K]
        : any
        : K extends keyof KeactTypeRegistry
        ? KeactTypeRegistry[K]
        : any
    ) => void
  ] {
  const contextFromTree = useContext(KeactCurrentContext);
  const context = options?.context ?? null;
  const isContext = context !== null;

  if (isContext && contextFromTree !== context) {
    throw new Error(`Cannot access Keact context "${context}" outside of its provider.`);
  }

  const getDefaultFallback = (val: any) => {
    if (Array.isArray(val)) return [];
    if (val instanceof Set) return new Set();
    if (val instanceof Map) return new Map();
    if (typeof val === "object" && val !== null) return {};
    if (typeof val === "number") return 0;
    if (typeof val === "string") return "";
    if (typeof val === "boolean") return false;
    return undefined;
  };

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

  const getServerSnapshot = () => {
    if (isContext) {
      contextStores[context] ||= {};
      if (!(key in contextStores[context]) && options?.initialValue !== undefined) {
        contextStores[context][key] = getDefaultFallback(contextStores[context][key] || options?.initialValue);
      }
      return contextStores[context][key];
    } else {
      if (!(key in globalStore) && options?.initialValue !== undefined) {
        globalStore[key] = getDefaultFallback(globalStore[key] || options?.initialValue);

        globalStore[key] = options.initialValue;
      }
      return globalStore[key];
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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