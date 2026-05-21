import { CodecData, CodecLayout, Config, Format, unpack } from "./codec";

/**
 * do not type the decode fn as Decoder<T>
 */
export type Decoder<T extends CodecData> = (
    buf: Uint8Array,
    layout?: CodecLayout
) => T | null;


/** Decodes: bytes -> Uint8Array */
export const decodeU8: Decoder<Uint8Array> = ( buf, layout ) => {
    return decode<Uint8Array>( buf, layout )
}

/** Decodes: bytes -> Uint16Array */
export const decodeU16: Decoder<Uint16Array> = ( buf, layout ) => {
    return decode<Uint16Array>( buf, layout )
}


/**
 * Decodes and unpacks a u8 buffer into it's own type ... returns values for easier iteration
 * buf -> CodecData
 */
export function decode<T extends CodecData>( buf: Uint8Array, layout?: CodecLayout ): T | null {
    const dbg = false

    dbg && console.log( 'buf', { buf } )

    // unpack
    const bytes = unpack( buf, layout )
    dbg && console.log( { bytes } )
    if ( ! bytes ) return null;

    const format = buf[1] as Format;

    // get the spec
    const conf = Config[format]
    dbg && console.log( { conf } )
    if ( ! conf ) return null;

    // create memory view
    const data = new conf.ctor(
        bytes.buffer as ArrayBuffer,
        bytes.byteOffset,
        bytes.byteLength / conf.size
    ) as unknown as T
    dbg && console.log( { data } )

    return data
}
