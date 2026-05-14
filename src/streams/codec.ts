const HEADER_SIZE = 4 // 1 word
const VERSION: Version = 1

export type Version = 1

export enum Format {
    // raw int
    raw_u8 = 0x1,
    raw_u16 = 0x2,
    // audio frequency domain
    audio_freq_u8 = 0x10,
    audio_freq_u16 = 0x11,
    audio_freq_f32 = 0x12,
    // audio time domain
    audio_time_u8 = 0x20,
    audio_time_u16 = 0x21,
    audio_time_f32 = 0x22,
    // vectors
    vec2_u8 = 0x30,
    vec2_u16 = 0x31,
    vec3_u8 = 0x32,
    vec3_u16 = 0x33,
}

const CONFIG: Record<Format, {
    stride: number;
    size: number;
    ctor:
        | typeof Uint8Array
        | typeof Uint16Array
        | typeof Float32Array
}> = {
    // Format : <shape>_<scalar-type>
    // Stride : logical width of vector in bytes
    // Size   : width of vector scalar / component in bytes
    // Ctor   : constructor used to create the data
    [Format.raw_u8]: { stride: 1, size: 1, ctor: Uint8Array },
    [Format.raw_u16]: { stride: 2, size: 2, ctor: Uint16Array },
    [Format.audio_freq_u8]: { stride: 1, size: 1, ctor: Uint8Array },
    [Format.audio_freq_u16]: { stride: 2, size: 2, ctor: Uint16Array },
    [Format.audio_freq_f32]: { stride: 4, size: 4, ctor: Float32Array },
    [Format.audio_time_u8]: { stride: 1, size: 1, ctor: Uint8Array },
    [Format.audio_time_u16]: { stride: 2, size: 2, ctor: Uint16Array },
    [Format.audio_time_f32]: { stride: 4, size: 4, ctor: Float32Array },
    [Format.vec2_u8]: { stride: 2, size: 1, ctor: Uint8Array },
    [Format.vec2_u16]: { stride: 4, size: 2, ctor: Uint16Array },
    [Format.vec3_u8]: { stride: 3, size: 1, ctor: Uint8Array },
    [Format.vec3_u16]: { stride: 6, size: 2, ctor: Uint16Array },
}

export function strideFor( format: Format ): number {
    return CONFIG[format].stride || 1
}

export function isU16Format( f: Format ) {

}

/**
 * Packs an ArrayBufferView with 1-word header.
 */
export function pack( format: Format, data: ArrayBufferView ): Uint8Array {
    // allocate new memory to add header
    const pkg = new Uint8Array( HEADER_SIZE + data.byteLength )

    // define header
    pkg[0] = VERSION;
    pkg[1] = format
    pkg[2] = strideFor( format )
    pkg[3] = 0 // filler

    // copy the data into the packet
    pkg.set( new Uint8Array( data.buffer, data.byteOffset, data.byteLength ), HEADER_SIZE )

    return pkg
}

/**
 * Unpacks the header and provides a zero-copy subarray of the data
 */
export interface Unpacked {
    format: Format
    stride: number
    bytes: Uint8Array
}

export function unpack( data: ArrayBufferView ): Unpacked | null {
    if ( data.byteLength < HEADER_SIZE ) return null;

    // zero-copy
    const view = data instanceof Uint8Array
        ? data
        : new Uint8Array( data.buffer, data.byteOffset, data.byteLength )

    return {
        format: view[1] as Format,
        stride: view[2],
        bytes: view.subarray( HEADER_SIZE )
    }
}


/**
 * decodes and unpacks the buffer and returns values for easy iteration
 */
export interface Decoded<T extends ArrayBufferView = ArrayBufferView> {
    format: Format
    stride: number
    step: number
    data: T
}

export function decode<T extends ArrayBufferView>( buf: ArrayBufferView ): Decoded<T> | null {

    const unpacked = unpack( buf )
    if ( ! unpacked ) return null;

    const { format, bytes } = unpacked
    const conf = CONFIG[format]
    console.log( { conf } )

    if ( ! conf ) return null;

    const data = new conf.ctor(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength / conf.size
    ) as T

    return {
        format,
        stride: conf.stride,
        step: conf.stride / conf.size,
        bytes: data
    }
}

export function decodeU8( buf: ArrayBufferView ): Decoded<Uint8Array> | null {
    return decode<Uint8Array>( buf )
}

export function decodeU16( buf: ArrayBufferView ): Decoded<Uint16Array> | null {
    return decode<Uint16Array>( buf )
}

export function decodeF32( buf: ArrayBufferView ): Decoded<Float32Array> | null {
    return decode<Float32Array>( buf )
}
