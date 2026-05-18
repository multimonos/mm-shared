/**
 * Interface only as different Transport methods must implement their own way of getting data to the broker.
 */
export interface DataProducer {
    /** Sends data via the broker... egress */
    push( data: Uint8Array | Record<string, unknown> | string ): void;

    /** Push data to the broker */
    sendData( bytes: Uint8Array ): void;

    /** Push metadata to the broker */
    sendMeta( meta: Record<string, unknown> ): void;

    /** Close the connection */
    close?: () => void;
};