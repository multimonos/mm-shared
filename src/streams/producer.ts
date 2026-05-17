import { CodecData } from "./codec/codec";

export interface DataProducer {
    /* sends data ... egress */
    push( data: CodecData | Record<string, unknown> | string ): void;
    sendData( bytes: CodecData ): void;
    sendMeta( meta: Record<string, unknown> ): void;
    close?: () => void;
};