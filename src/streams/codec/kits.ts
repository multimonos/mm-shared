import { CodecData, CodecLayout, Config, Format, pack, unpack } from "./codec";
import { Decoder, decodeU16, decodeU8 } from "./decode";
import { u16map, u16norm, u8map, u8norm } from "./mapping"

export enum CodecKitType {
    u8 = 'u8_kit',
    u16 = 'u16_kit'
}

export interface CodecKit<T extends CodecData> {
    type: CodecKitType;
    readonly buf: T;
    initBuffer( len: number ): void;
    decode: Decoder<T>
    map( v: number, max: number ): number;
    unmap( v: number,max:number ): number;
    norm( v: number ): number;
    pack( data: CodecData<T> ): Uint8Array;
    unpack( bytes: Uint8Array, layout?: CodecLayout ): Uint8Array | null;
}


export function u8kit( format: Format ): CodecKit<Uint8Array> {

    // config
    let conf = Config[format]
    if ( ! conf ) throw new Error( `Config not found for ${ format }` )

    // scavenger buffer
    let buf: CodecData<Uint8Array> = null as any

    return {
        type: CodecKitType.u8,
        initBuffer: ( len: number ) => {
            buf = new (conf.ctor as any)( len )
        },
        get buf(): CodecData<Uint8Array> {
            return buf
        },
        decode: decodeU8,
        map: u8map,
        unmap: ( v: number, max: number ) => u8norm( v ) * max,
        norm: u8norm,
        pack: ( data: CodecData<Uint8Array> ) => pack( format, data ),
        unpack,
    }
}

export function u16kit( format: Format ): CodecKit<Uint16Array> {

    // config
    let conf = Config[format]
    if ( ! conf ) throw new Error( `Config not found for ${ format }` )

    // scavenger buffer
    let buf: CodecData<Uint16Array> = null as any

    return {
        type: CodecKitType.u16,
        initBuffer: ( len: number ) => {
            buf = new (conf.ctor as any)( len )
        },
        get buf(): CodecData<Uint16Array> {
            return buf
        },
        decode: decodeU16,
        map: u16map,
        norm: u16norm,
        unmap: ( v: number, max: number ) => u16norm( v ) * max,
        pack: ( data: CodecData<Uint16Array> ) => pack( format, data ),
        unpack,
    }
}