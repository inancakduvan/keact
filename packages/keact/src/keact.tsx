import { useState, useEffect } from 'react';
import { useSyncExternalStore } from 'react';

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

// Context-specific stores
const contextStores: Record<string, Record<string, any>> = {};
const contextListeners: Record<string, Record<string, Set<() => void>>> = {};

// Main hook
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
  const [contextName] = useState(options?.context); // Use provided context name

  const isContextBased = contextName !== undefined;

  // Handle initialization and store updates
  useEffect(() => {
    if (isContextBased) {
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
      const listener = () => {};
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
      const listener = () => {};
      listenerSet.add(listener);

      // Cleanup
      return () => {
        listenerSet.delete(listener);
      };
    }
  }, [key, contextName, isContextBased]);

  // Getter using useSyncExternalStore
  const getValue = () => {
    return isContextBased
      ? contextStores[contextName]?.[key] !== undefined
        ? contextStores[contextName][key]
        : options?.initialValue
      : globalStore[key] !== undefined
      ? globalStore[key]
      : options?.initialValue;
  };

  const subscribe = (callback: () => void) => {
    if (isContextBased) {
      contextListeners[contextName][key]?.add(callback);
      return () => contextListeners[contextName][key]?.delete(callback);
    } else {
      listeners[key]?.add(callback);
      return () => listeners[key]?.delete(callback);
    }
  };

  // Using useSyncExternalStore for synchronization
  const value = useSyncExternalStore(subscribe, getValue, getValue);

  // Setter
  const setValue = (newValue: any) => {
    if (isContextBased) {
      if (!contextStores[contextName]) {
        contextStores[contextName] = {};
      }
      
      const nextValue = typeof newValue === 'function'
        ? newValue(contextStores[contextName][key])
        : newValue;
        
      contextStores[contextName][key] = nextValue;
      
      // Notify listeners
      contextListeners[contextName]?.[key].forEach(listener => listener());
    } else {
      const nextValue = typeof newValue === 'function'
        ? newValue(globalStore[key])
        : newValue;
        
      globalStore[key] = nextValue;
      
      // Notify listeners
      listeners[key]?.forEach(listener => listener());
    }
  };

  return [value, setValue];
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
