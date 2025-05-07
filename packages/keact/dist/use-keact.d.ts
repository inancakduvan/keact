export interface KeactTypeRegistry {
}
export declare function useKeact<K extends keyof KeactTypeRegistry>(key: K, initializer?: () => KeactTypeRegistry[K]): [KeactTypeRegistry[K], (v: KeactTypeRegistry[K]) => void];
