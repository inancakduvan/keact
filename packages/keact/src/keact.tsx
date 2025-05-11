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
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_GLOBAL_STORE__ = globalStore;
    (window as any).__KEACT_CONTEXT_STORES__ = contextStores;
  }
}

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
  const context = options?.context ?? contextFromTree;
  const isContext = context !== undefined && context !== null;

  // UYARI: context dışındayken context'li state'e erişim varsa engelle
  if (options?.context && contextFromTree !== options.context) {
    throw new Error(
      `Cannot access Keact context "${options.context}" outside of its provider.`
    );
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
      if (!(context in contextStores)) return options?.initialValue;
      return contextStores[context][key] ?? options?.initialValue;
    } else {
      return globalStore[key] ?? options?.initialValue;
    }
  };

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setValue = (val: any) => {
    const next = typeof val === "function" ? val(value) : val;

    if (isContext) {
      if (!(context in contextStores)) return;
      contextStores[context][key] = next;
      contextListeners[context]?.[key]?.forEach((l) => l());
    } else {
      globalStore[key] = next;
      globalListeners[key]?.forEach((l) => l());
    }
  };

  return [value, setValue];
}

// ========== GETTERS & SETTERS ==========
export function getKeactValue<K extends keyof KeactTypeRegistry>(key: K): KeactTypeRegistry[K] {
  return globalStore[key];
}

export function setKeactValue<K extends keyof KeactTypeRegistry>(
  key: K,
  value: KeactTypeRegistry[K]
): void {
  globalStore[key] = value;
  globalListeners[key]?.forEach((l) => l());
}

export function getKeactContextValue<C extends string, K extends string>(
  contextName: C,
  key: K
): C extends keyof KeactContextTypeRegistry
  ? K extends keyof KeactContextTypeRegistry[C]
    ? KeactContextTypeRegistry[C][K]
    : unknown
  : unknown {
  return contextStores[contextName]?.[key];
}

export function setKeactContextValue<C extends string, K extends string>(
  contextName: C,
  key: K,
  value: C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
      ? KeactContextTypeRegistry[C][K]
      : unknown
    : unknown
): void {
  contextStores[contextName] ||= {};
  contextStores[contextName][key] = value;
  contextListeners[contextName]?.[key]?.forEach((l) => l());
}

// ========== RESET HELPERS ==========
export function resetKeact() {
  Object.keys(globalStore).forEach((k) => delete globalStore[k]);
  Object.values(globalListeners).forEach((set) => set.clear());
}

export function resetKeactContext(contextName: string) {
  delete contextStores[contextName];
  delete contextListeners[contextName];
}
