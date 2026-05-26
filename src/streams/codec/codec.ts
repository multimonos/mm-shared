export const HEADER_SIZE = 4 // 1 word
export const VERSION: Version = 1
export const U8_MAX = 255 as const
export const U16_MAX = 65535 as const

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
    max?: number;
}

export enum Format {
    unknown = 0xff,

    raw_u8 = 0x1, // vector of N u8 ( raw values )
    raw_u16 = 0x2, // vector of N u16 ( raw values )
    raw_u16i = 0x3, // vector of N u16 tuples ( value, index )

    audio_freq_u8 = 0x10, // vector of N db levels as u8
    audio_freq_u16 = 0x11, // vector of N db levels as u16

    audio_time_u8 = 0x20, // vector of N signed floats as u8
    audio_time_u16 = 0x21, // vector N signed floats as u16

    vec2_u8 = 0x30, // position vec2 as u8
    vec2_u16 = 0x31, // position vec2 as u16
    vec3_u8 = 0x32, // position vec3 as u8
    vec3_u16 = 0x33,// position vec3 as u16
}


/** Config / Registry */
export const Config: Record<Format, {
    format: Format; // Format: <shape>_<scalar-type>
    stride: number; // Stride: distance to the next vector in bytes
    size: number; // Size: width of each vector component in bytes
    max: typeof U8_MAX | typeof U16_MAX;
    ctor: // Constructor : constructor used to store Format
        | typeof Uint8Array
        | typeof Uint16Array
}> = {
    [Format.unknown]: { format: Format.unknown, stride: 0, size: 0, ctor: null, max: null },
    [Format.raw_u8]: { format: Format.raw_u8, stride: 1, size: 1, ctor: Uint8Array, max: U8_MAX },
    [Format.raw_u16]: { format: Format.raw_u16, stride: 2, size: 2, ctor: Uint16Array, max: U16_MAX },
    [Format.raw_u16i]: { format: Format.raw_u16, stride: 4, size: 2, ctor: Uint16Array, max: U16_MAX },
    [Format.audio_freq_u8]: { format: Format.audio_freq_u8, stride: 1, size: 1, ctor: Uint8Array, max: U8_MAX },
    [Format.audio_freq_u16]: { format: Format.audio_freq_u16, stride: 2, size: 2, ctor: Uint16Array, max: U16_MAX },
    [Format.audio_time_u8]: { format: Format.audio_time_u8, stride: 1, size: 1, ctor: Uint8Array, max: U8_MAX },
    [Format.audio_time_u16]: { format: Format.audio_time_u16, stride: 2, size: 2, ctor: Uint16Array, max: U16_MAX },
    [Format.vec2_u8]: { format: Format.vec2_u8, stride: 2, size: 1, ctor: Uint8Array, max: U8_MAX },
    [Format.vec2_u16]: { format: Format.vec2_u16, stride: 4, size: 2, ctor: Uint16Array, max: U16_MAX },
    [Format.vec3_u8]: { format: Format.vec3_u8, stride: 3, size: 1, ctor: Uint8Array, max: U8_MAX },
    [Format.vec3_u16]: { format: Format.vec3_u16, stride: 6, size: 2, ctor: Uint16Array, max: U16_MAX },
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

    // copy the data into the packet using header size as the offset
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
export function unpack( bytes: Uint8Array, layout?: CodecLayout ): Uint8Array | null {
    if ( bytes.byteLength < HEADER_SIZE ) return null;

    const conf = Config[bytes[1] as Format]
    if ( ! conf ) return null;

    if ( layout ) {
        layout.format = bytes[1] as Format
        layout.stride = conf.stride
        layout.size = conf.size
        layout.max = conf.max
    }

    // zero copy not zero alloc
    return bytes.subarray( HEADER_SIZE )
}

