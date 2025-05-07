import { useSyncExternalStore } from 'react';
const store = new Map();
const exposeStoreToWindow = () => {
    // Expose store to window in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        window.__KEACT_STORE__ = store;
    }
};
exposeStoreToWindow();
export function useKeact(key, initializer) {
    const isInitialized = store.has(key);
    if (!isInitialized) {
        const initialValue = initializer?.();
        store.set(key, {
            value: initialValue,
            listeners: new Set(),
        });
    }
    const getSnapshot = () => {
        const entry = store.get(key);
        return entry?.value;
    };
    const subscribe = (callback) => {
        const entry = store.get(key);
        entry?.listeners.add(callback);
        return () => {
            entry?.listeners.delete(callback);
        };
    };
    const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const setValue = (v) => {
        const entry = store.get(key);
        if (entry) {
            entry.value = v;
            entry.listeners.forEach((cb) => cb());
            exposeStoreToWindow();
        }
    };
    return [value, setValue];
}
