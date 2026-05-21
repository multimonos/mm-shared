import { CodecData, Config, Format, pack } from "./codec";
import { quant16, quant8, squant16, squant8 } from "./mapping";


export interface CodecWriter {
    // getters
    buf: CodecData;
    format: string;
    max: 255 | 65535;
    type: 'u8' | 'u16';

    // other
    initBuffer: ( length: number ) => void;
    pack: () => Uint8Array;
    quant: ( v: number ) => number;
    squant: ( v: number ) => number;
}

export function createCodecWriter( format: Format ): CodecWriter {
    // resolve config
    const conf = Config[format]
    if ( ! conf ) throw new Error( `CodecFormat not found '${ format }'` )

    // scavengers
    let buf: CodecData = null as any

    console.log( 'format:', Format[format] )

    // U8
    const u8Writer: CodecWriter = {
        get type() { return 'u8' },
        get max() { return conf.max},
        get buf() { return buf },
        get format() { return Format[format] },

        initBuffer( length: number ) {
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
        get type() { return 'u16'},
        get max() {return conf.max},
        get buf() { return buf },
        get format() { return Format[format] },

        initBuffer( length: number ) {
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
