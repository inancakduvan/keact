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
        const initialValue = initializer === null || initializer === void 0 ? void 0 : initializer();
        store.set(key, {
            value: initialValue,
            listeners: new Set(),
        });
    }
    const getSnapshot = () => {
        const entry = store.get(key);
        return entry === null || entry === void 0 ? void 0 : entry.value;
    };
    const subscribe = (callback) => {
        const entry = store.get(key);
        entry === null || entry === void 0 ? void 0 : entry.listeners.add(callback);
        return () => {
            entry === null || entry === void 0 ? void 0 : entry.listeners.delete(callback);
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
