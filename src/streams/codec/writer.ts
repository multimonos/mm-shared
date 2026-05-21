import { CodecData, Config, Format, pack, U16_MAX, U8_MAX } from "./codec";
import { quant16, quant8, squant16, squant8 } from "./mapping";


export interface CodecWriter {
    // getters
    buf: CodecData;
    format: string;
    max: typeof U8_MAX | typeof U16_MAX;
    size: number;

    // other
    initBuffer: ( length: number ) => void;
    pack: () => Uint8Array;
    quant: ( v: number ) => number;
    squant: ( v: number ) => number;
}

export type CodecWriterOptions = {
    size?: number;
}

export function createCodecWriter(
    format: Format,
    options: CodecWriterOptions = {
        size: 0
    } ): CodecWriter {

    // resolve config
    const conf = Config[format]
    if ( ! conf ) throw new Error( `CodecFormat not found '${ format }'` )

    // state
    let { size } = options
    let buf: CodecData = new conf.ctor( options.size )

    console.log( 'format:', Format[format] )

    // U8
    const u8Writer: CodecWriter = {
        get buf() { return buf },
        get size() { return size },
        get max() { return conf.max},
        get format() { return Format[format] },

        initBuffer( length: number ) {
            size = length
            buf = new Uint8Array( length )
        },

        /** unsigned quantization ... x : [0.0, 1.0] -> [0, range] */
        quant: quant8,

        /** signed quantization ... x : [-1.0, 1.0] -> [0, range] */
        squant: squant8,

        pack: () => {
            return pack( format, buf )
        },

    } as CodecWriter

    // U16
    const u16Writer = {
        get buf() { return buf },
        get size() { return size },
        get max() { return conf.max },
        get format() { return Format[format] },

        initBuffer( length: number ) {
            size = length
            buf = new Uint16Array( length )
        },

        quant: quant16,
        squant: squant16,

        pack: () => {
            return pack( format, buf )
        },

    } as CodecWriter

    // Return the api
    return conf.ctor === Uint8Array
        ? u8Writer
        : u16Writer
}
