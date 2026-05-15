const HEADER_SIZE = 4 // 1 word
const VERSION: Version = 1

/** Header **/
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

const CodecConfig: Record<Format, {
    format: Format; // Format: <shape>_<scalar-type>
    stride: number; // Stride: distance to the next vector in bytes
    size: number; // Size: width of each vector component in bytes
    step: number; // Step: distance to next vector in indices ... how many indices to next vector
    ctor: // Constructor : constructor used to store Format
        | typeof Uint8Array
        | typeof Uint16Array
        | typeof Float32Array
}> = {

    [Format.raw_u8]: { format: Format.raw_u8, stride: 1, size: 1, step: 1, ctor: Uint8Array },
    [Format.raw_u16]: { format: Format.raw_u16, stride: 2, size: 2, step: 1, ctor: Uint16Array },
    [Format.audio_freq_u8]: { format: Format.audio_freq_u8, stride: 1, size: 1, step: 1, ctor: Uint8Array },
    [Format.audio_freq_u16]: { format: Format.audio_freq_u16, stride: 2, size: 2, step: 1, ctor: Uint16Array },
    [Format.audio_freq_f32]: { format: Format.audio_freq_f32, stride: 4, size: 4, step: 1, ctor: Float32Array },
    [Format.audio_time_u8]: { format: Format.audio_time_u8, stride: 1, size: 1, step: 1, ctor: Uint8Array },
    [Format.audio_time_u16]: { format: Format.audio_time_u16, stride: 2, size: 2, step: 1, ctor: Uint16Array },
    [Format.audio_time_f32]: { format: Format.audio_time_f32, stride: 4, size: 4, step: 1, ctor: Float32Array },
    [Format.vec2_u8]: { format: Format.vec2_u8, stride: 2, size: 1, step: 2, ctor: Uint8Array },
    [Format.vec2_u16]: { format: Format.vec2_u16, stride: 4, size: 2, step: 2, ctor: Uint16Array },
    [Format.vec3_u8]: { format: Format.vec3_u8, stride: 3, size: 1, step: 3, ctor: Uint8Array },
    [Format.vec3_u16]: { format: Format.vec3_u16, stride: 6, size: 2, step: 3, ctor: Uint16Array },
}


/** Helper */
export function strideFor( format: Format ): number {
    return CodecConfig[format].stride || 1
}


/**
 * Packs an ArrayBufferView with 1-word header.
 *
 * CodecData -> Bytes
 */
export type CodecData =
    | Uint8Array
    | Uint16Array
    | Float32Array

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
 */
export type CodecLayout = {
    format?: Format;
    stride?: number;
    step?: number;
}

export function unpack( bytes: ArrayBufferView, layout?: CodecLayout ): Uint8Array | null {
    if ( bytes.byteLength < HEADER_SIZE ) return null;

    // zero-copy
    const view = bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array( bytes.buffer, bytes.byteOffset, bytes.byteLength )

    const conf = CodecConfig[view[1] as Format]
    if ( ! conf ) return null;

    if ( layout ) {  // cut this out with a SCAVENGER default for layout
        layout.format = view[1] as Format
        layout.stride = conf.stride
        layout.step = conf.step
    }

    return view.subarray( HEADER_SIZE )
}


/**
 * Decodes and unpacks the buffer and returns values for easy iteration
 * buf -> CodecData
 */
export function decode<T extends CodecData>( buf: ArrayBufferView, layout?: CodecLayout ): T | null {

    // unpack
    const bytes = unpack( buf )
    if ( ! bytes ) return null;

    // We know buf[1] is safe because unpack succeeded.
    // We cast to Uint8Array once to get fast index access.
    const view = buf instanceof Uint8Array
        ? buf
        : new Uint8Array( buf.buffer, buf.byteOffset ); // Skipe length bounds check here ( no bytes.byteLength ).
    const format = view[1] as Format;

    // get the spec
    const conf = CodecConfig[format]
    if ( ! conf ) return null;

    // meta
    if ( layout ) {  // cut this out with a SCAVENGER default for layout
        layout.format = conf.format
        layout.stride = conf.stride
        layout.step = conf.step
    }

    // create memory view
    const data = new conf.ctor(
        bytes.buffer as ArrayBuffer,
        bytes.byteOffset,
        bytes.byteLength / conf.size
    ) as unknown as T

    return data
}

/** Decodes: bytes -> Uint8Array */
export function decodeU8( buf: ArrayBufferView, layout?: CodecLayout ) {
    return decode<Uint8Array>( buf, layout )
}

/** Decodes: bytes -> Uint16Array */
export function decodeU16( buf: ArrayBufferView, layout?: CodecLayout ) {
    return decode<Uint16Array>( buf, layout )
}

/** Decodes: bytes -> Float32Array */
export function decodeF32( buf: ArrayBufferView, layout?: CodecLayout ) {
    return decode<Float32Array>( buf, layout )
}

/** Maps: number -> [0, 255] */
export function u8map( v: number, limit: number ): number {
    return Math.floor( (v / limit) * 255 ) // 256 - 1
}

/** Maps: number -> [0, 65535] */
export function u16map( v: number, limit: number ): number {
    return Math.floor( (v / limit) * 65535 ) // 256 * 256 - 1
}

/** Maps: float -> [0.0, 1.0] */
export function f32map( v: number, limit: number ): number {
    return v / limit // normalize
}

/** Maps: u8 -> [0.0, 1.0] */
export function u8norm( v: number ): number {
    return v / 255
}

/** Maps: u16 -> [0.0, 1.0] */
export function u16norm( v: number ): number {
    return v / 65535
}