export interface DataProducer {
    /* sends data ... egress */
    push( data: Uint8Array | Record<string, unknown> | string ): void;
    sendData( bytes: Uint8Array ): void;
    sendMeta( meta: Record<string, unknown> ): void;
    close?: () => void;
};