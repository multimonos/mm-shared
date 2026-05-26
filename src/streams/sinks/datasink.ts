export interface DataSink<T = Uint8Array | Uint8Array[]> {
    readonly data: Map<number, T>;
    readonly meta: Map<number, Record<string, unknown>>;
    clear: ( senderId: number ) => void;
    clearAll: () => void;
    destroy: () => void;
}