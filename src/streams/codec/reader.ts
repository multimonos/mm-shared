import { CodecLayout, Config, Format, HEADER_SIZE, U16_MAX, U8_MAX } from "./codec";
import { snorm, unorm } from "./mapping";


export interface CodecReader {
    // getters
    buf: Uint8Array;
    format: string;
    layout: CodecLayout;
    max: typeof U8_MAX | typeof U16_MAX;
    stride: number;

    // reading
    unpack: ( bytes: Uint8Array ) => Uint8Array | null;
    count: number;
    nth: ( index: number ) => number,
    read: ( bytes: Uint8Array, start: number ) => number;

    // un-mapping
    unorm: ( v: number ) => number;
    snorm: ( v: number ) => number;

    destroy: () => void;
}

export function createCodecReader() {
    // scavengers
    let buf: Uint8Array = new Uint8Array( 0 )
    let view = new DataView( buf.buffer )
    let layout: CodecLayout = {
        format: Format.unknown,
        stride: 0,
        size: 0,
        max: 0
    }

    return {
        get buf() { return buf },
        get format() { return Format[layout.format] },
        get layout() { return layout; },
        get max() { return layout.max },
        get stride() { return layout.stride },

        unpack: ( bytes: Uint8Array ) => {
            if ( bytes.byteLength < HEADER_SIZE ) return null;

            const conf = Config[bytes[1] as Format]
            if ( ! conf ) return null;

            // update buffer layout
            layout.format = bytes[1] as Format
            layout.stride = conf.stride
            layout.size = conf.size
            layout.max = conf.max

            // create a view
            view = new DataView( bytes.buffer, bytes.byteOffset + HEADER_SIZE, bytes.byteLength - HEADER_SIZE )

            // zero copy not zero alloc
            buf = bytes.subarray( HEADER_SIZE )

            return buf
        },

        /** unsigned normalization ... x : [0, range] -> [0.0, 1.0] */
        unorm: ( v: number ) => {
            return unorm( v, layout.max )
        },

        /** signed normalization ... x : [0, range] -> [-1.0, 1.0] */
        snorm: ( v: number ) => {
            return snorm( v, layout.max )
        },

        /** term count */
        get count() {
            return layout.size ? buf.length / layout.size : 0
        },

        /** nth term accessor */
        nth: ( index: number ) => {
            // access simplified via the data view scavenger
            if ( ! layout.size ) return 0;

            const offset = index * layout.size

            if ( layout.size === 1 ) {
                return view.getUint8( offset )
            }

            if ( layout.size === 2 ) {
                return view.getUint16( offset, true ) // little endian
            }

            return 0
        },

        /** low level reader for unpacked data */
        read: ( bytes: Uint8Array, start: number ) => {
            return readBytes( bytes, start, layout.size )
        },

        destroy:()=>{

        }

    } as CodecReader
}


/** Reads [start, start + byteCount] bytes from a Uint8Array  */
export function readBytes( bytes: Uint8Array, start: number, byteCount: number ): number {
    const byteOffset = byteCount - 1 // should be on the layout ( pre-calc )
    const shift = byteOffset * 8 // should be on the layout ( pre-calc )
    const high = bytes[start + byteOffset] ?? 0
    const low = bytes[start] ?? 0
    return ((high << shift) | low) >>> 0
}
