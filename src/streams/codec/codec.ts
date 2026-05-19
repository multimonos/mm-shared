const HEADER_SIZE = 4 // 1 word
const VERSION: Version = 1
export const U8_MAX = 255
export const U16_MAX = 65535

export function strideFor( format: Format ): number {
    return Config[format].stride || 1
}


/** Types */
export type Version = 1

export type CodecData<T extends Uint8Array | Uint16Array = Uint8Array | Uint16Array> = T

export type CodecLayout = {
    format?: Format;
    stride?: number; // Useful for iter a Uint8Array only
    size?: number; // Useful for iter Uint8Array only
}

export enum Format {
    // raw int
    raw_u8 = 0x1,
    raw_u16 = 0x2,
    // audio frequency domain
    audio_freq_u8 = 0x10,
    audio_freq_u16 = 0x11,
    // audio time domain
    audio_time_u8 = 0x20,
    audio_time_u16 = 0x21,
    // vectors
    vec2_u8 = 0x30,
    vec2_u16 = 0x31,
    vec3_u8 = 0x32,
    vec3_u16 = 0x33,
}


/** Config / Registry */
export const Config: Record<Format, {
    format: Format; // Format: <shape>_<scalar-type>
    stride: number; // Stride: distance to the next vector in bytes
    size: number; // Size: width of each vector component in bytes
    ctor: // Constructor : constructor used to store Format
        | typeof Uint8Array
        | typeof Uint16Array
}> = {
    [Format.raw_u8]: { format: Format.raw_u8, stride: 1, size: 1, ctor: Uint8Array },
    [Format.raw_u16]: { format: Format.raw_u16, stride: 2, size: 2, ctor: Uint16Array },
    [Format.audio_freq_u8]: { format: Format.audio_freq_u8, stride: 1, size: 1, ctor: Uint8Array },
    [Format.audio_freq_u16]: { format: Format.audio_freq_u16, stride: 2, size: 2, ctor: Uint16Array },
    [Format.audio_time_u8]: { format: Format.audio_time_u8, stride: 1, size: 1, ctor: Uint8Array },
    [Format.audio_time_u16]: { format: Format.audio_time_u16, stride: 2, size: 2, ctor: Uint16Array },
    [Format.vec2_u8]: { format: Format.vec2_u8, stride: 2, size: 1, ctor: Uint8Array },
    [Format.vec2_u16]: { format: Format.vec2_u16, stride: 4, size: 2, ctor: Uint16Array },
    [Format.vec3_u8]: { format: Format.vec3_u8, stride: 3, size: 1, ctor: Uint8Array },
    [Format.vec3_u16]: { format: Format.vec3_u16, stride: 6, size: 2, ctor: Uint16Array },
}


/**
 * Packs an ArrayBufferView with 1-word header.
 *
 * CodecData -> Bytes
 */
export function pack( format: Format, data: CodecData ): Uint8Array {
    // allocate new memory to add header
    const bytes = new Uint8Array( HEADER_SIZE + data.byteLength )

    // define header
    bytes[0] = VERSION;
    bytes[1] = format
    bytes[2] = strideFor( format )
    bytes[3] = 0 // filler

    // copy the data into the packet
    bytes.set( new Uint8Array( data.buffer, data.byteOffset, data.byteLength ), HEADER_SIZE )

    return bytes
}


/**
 * Discards the header and returns a zero-copy subarray of the data
 *
 * Bytes -> Uint8Array
 *
 * NOTE always return uint8array
 */
export function unpack( bytes: ArrayBufferView, layout?: CodecLayout ): Uint8Array | null {
    if ( bytes.byteLength < HEADER_SIZE ) return null;

    // zero-copy
    const view = bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array( bytes.buffer, bytes.byteOffset, bytes.byteLength )

    const conf = Config[view[1] as Format]
    if ( ! conf ) return null;

    if ( layout ) {  // cut this out with a SCAVENGER default for layout
        layout.format = view[1] as Format
        layout.stride = conf.stride
        layout.size = conf.size
    }

    return view.subarray( HEADER_SIZE )
}

