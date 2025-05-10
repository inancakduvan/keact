import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Type definitions
export interface KeactTypeRegistry {}
export interface KeactContextTypeRegistry {}

// Type helpers
type KeyofKeactTypeRegistry = keyof KeactTypeRegistry;
type ValueOfKeactTypeRegistry<K extends KeyofKeactTypeRegistry> = K extends keyof KeactTypeRegistry 
  ? KeactTypeRegistry[K] 
  : unknown;

// Define global store
const globalStore: Record<string, any> = {};
const listeners: Record<string, Set<() => void>> = {};

const exposeStoreToWindow = () => {
  // Expose store to window in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).__KEACT_STORE__ = globalStore;
  }
}

exposeStoreToWindow();

// Context-specific stores
const contextStores: Record<string, Record<string, any>> = {};
const contextListeners: Record<string, Record<string, Set<() => void>>> = {};

// Context Provider
type KeactContextProps = {
  name: string;
  children: ReactNode;
};

const KeactContextValues = createContext<string | null>(null);

export function KeactContext({ name, children }: KeactContextProps) {
  // Initialize context store if it doesn't exist
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

// Main hook
type KeactOptions<T> = {
  initialValue?: T;
  context?: string;
};

export function useKeact<K extends KeyofKeactTypeRegistry | string>(
  key: K, 
  options?: KeactOptions<K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any>
): [
  K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any,
  (value: K extends KeyofKeactTypeRegistry ? ValueOfKeactTypeRegistry<K> : any) => void
] {
  const contextValue = useContext(KeactContextValues);
  const [, forceUpdate] = useState({});

  const isContextBased = options?.context !== undefined;
  const contextName = options?.context || contextValue;

  // Handle initialization
  useEffect(() => {
    if (isContextBased && contextName) {
      // Initialize context-specific store
      if (!contextStores[contextName]) {
        contextStores[contextName] = {};
        contextListeners[contextName] = {};
      }

      // Initialize listeners for this context and key
      if (!contextListeners[contextName][key]) {
        contextListeners[contextName][key] = new Set();
      }

      // Initialize state if it doesn't exist
      if (contextStores[contextName][key] === undefined && options?.initialValue !== undefined) {
        contextStores[contextName][key] = options.initialValue;
      }

      // Add listener
      const listenerSet = contextListeners[contextName][key];
      const listener = () => forceUpdate({});
      listenerSet.add(listener);

      // Cleanup
      return () => {
        listenerSet.delete(listener);
      };
    } else {
      // Initialize listeners for global store
      if (!listeners[key]) {
        listeners[key] = new Set();
      }

      // Initialize state if it doesn't exist
      if (globalStore[key] === undefined && options?.initialValue !== undefined) {
        globalStore[key] = options.initialValue;
      }

      // Add listener
      const listenerSet = listeners[key];
      const listener = () => forceUpdate({});
      listenerSet.add(listener);

      // Cleanup
      return () => {
        listenerSet.delete(listener);
      };
    }
  }, [key, contextName, isContextBased]);

  // Getter
  const getValue = () => {
    if (isContextBased && contextName) {
      return contextStores[contextName]?.[key] !== undefined
        ? contextStores[contextName][key]
        : options?.initialValue;
    }
    return globalStore[key] !== undefined ? globalStore[key] : options?.initialValue;
  };

  // Setter
  const setValue = (newValue: any) => {
    if (isContextBased && contextName) {
      if (!contextStores[contextName]) {
        contextStores[contextName] = {};
      }
      
      // Handle functional updates
      const nextValue = typeof newValue === 'function'
        ? newValue(contextStores[contextName][key])
        : newValue;
        
      contextStores[contextName][key] = nextValue;
      
      // Notify listeners
      if (contextListeners[contextName]?.[key]) {
        contextListeners[contextName][key].forEach(listener => listener());
      }
    } else {
      // Handle functional updates
      const nextValue = typeof newValue === 'function'
        ? newValue(globalStore[key])
        : newValue;
        
      globalStore[key] = nextValue;
      
      // Notify listeners
      if (listeners[key]) {
        listeners[key].forEach(listener => listener());
      }
    }
  };

  return [getValue(), setValue];
}

// Context-specific hook with better typing
export function useKeactContext<C extends string, K extends string>(
  key: K,
  contextName: C,
  options?: KeactOptions<C extends keyof KeactContextTypeRegistry 
    ? K extends keyof KeactContextTypeRegistry[C]
      ? KeactContextTypeRegistry[C][K]
      : any
    : any>
): [
  C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
      ? KeactContextTypeRegistry[C][K]
      : any
    : any,
  (value: C extends keyof KeactContextTypeRegistry
    ? K extends keyof KeactContextTypeRegistry[C]
      ? KeactContextTypeRegistry[C][K]
      : any
    : any) => void
] {
  return useKeact(key, { ...options, context: contextName });
}

// Utility functions
export function getKeactValue<K extends KeyofKeactTypeRegistry>(
  key: K
): ValueOfKeactTypeRegistry<K> {
  return globalStore[key];
}

export function setKeactValue<K extends KeyofKeactTypeRegistry>(
  key: K, 
  value: ValueOfKeactTypeRegistry<K>
): void {
  const nextValue = typeof value === 'function'
    ? value(globalStore[key])
    : value;
    
  globalStore[key] = nextValue;
  
  if (listeners[key]) {
    listeners[key].forEach(listener => listener());
  }

  exposeStoreToWindow();
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
  if (!contextStores[contextName]) {
    contextStores[contextName] = {};
  }
  
  const nextValue = typeof value === 'function'
    ? value(contextStores[contextName][key])
    : value;
    
  contextStores[contextName][key] = nextValue;
  
  if (contextListeners[contextName]?.[key]) {
    contextListeners[contextName][key].forEach(listener => listener());
  }
}

// Reset functions for testing
export function resetKeact(): void {
  Object.keys(globalStore).forEach(key => {
    delete globalStore[key];
  });
  Object.keys(listeners).forEach(key => {
    listeners[key].clear();
  });
}

export function resetKeactContext(contextName: string): void {
  if (contextStores[contextName]) {
    delete contextStores[contextName];
  }
  if (contextListeners[contextName]) {
    delete contextListeners[contextName];
  }
}