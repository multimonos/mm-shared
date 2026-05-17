import { CodecData, CodecLayout, Config, Format, unpack } from "./codec";

/**
 * do not type the decode fn as Decoder<T>
 */
export type Decoder<T extends CodecData> = (
    buf: ArrayBufferView,
    laout?: CodecLayout
) => T | null;


/** Decodes: bytes -> Uint8Array */
export const decodeU8: Decoder<Uint8Array> = ( buf, layout ) => {
    return decode<Uint8Array>( buf, layout )
}

/** Decodes: bytes -> Uint16Array */
export const decodeU16: Decoder<Uint16Array> = ( buf, layout ) => {
    return decode<Uint16Array>( buf, layout )
}

/** Decodes: bytes -> Float32Array */
export const decodeF32: Decoder<Float32Array> = ( buf, layout ) => {
    return decode<Float32Array>( buf, layout )
}


/**
 * Decodes and unpacks a u8 buffer into it's own type ... returns values for easier iteration
 * buf -> CodecData
 */
export function decode<T extends CodecData>( buf: ArrayBufferView, layout?: CodecLayout ): T | null {

    // console.log( 'buf',buf.length )

    // unpack
    const bytes = unpack( buf )
    if ( ! bytes ) return null;

    // console.log( 'bytes',bytes.length )

    // We know buf[1] is safe because unpack succeeded.
    // We cast to Uint8Array once to get fast index access.
    const view = buf instanceof Uint8Array
        ? buf
        : new Uint8Array( buf.buffer, buf.byteOffset ); // Skipe length bounds check here ( no bytes.byteLength ).
    const format = view[1] as Format;

    // get the spec
    const conf = Config[format]
    if ( ! conf ) return null;

    // meta
    if ( layout ) {  // cut this out with a SCAVENGER default for layout
        layout.format = conf.format
        layout.stride = conf.stride
        layout.size = conf.size
    }

    // create memory view
    const data = new conf.ctor(
        bytes.buffer as ArrayBuffer,
        bytes.byteOffset,
        bytes.byteLength / conf.size
    ) as unknown as T

    // console.log( 'data',data.length )

    return data
}
