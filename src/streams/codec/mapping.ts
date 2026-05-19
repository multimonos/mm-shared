import { CodecLayout, Config } from "./codec";

/** Maps: [-inf, inf] -> [0, 255] */
export function u8map( v: number, rangeMax: number ): number {
    return mapint_v1( v, rangeMax, 255 )
}

/** Maps: [-inf, inf] -> [0, 65535] */
export function u16map( v: number, rangeMax: number ): number {
    return mapint_v1( v, rangeMax, 65535 )
}

/** Maps: u8 of [0, 255] -> [0.0, 1.0] */
export function u8norm( v: number ): number {
    return v / 255
}

/** Maps: u16 of [0, 65535] -> [0.0, 1.0] */
export function u16norm( v: number ): number {
    return v / 65535
}

/** Maps uint* -> [0.0,1.0] */
export function norm( v: number, layout: CodecLayout ): number {
    const conf = Config[layout.format]
    if ( conf.ctor === Uint8Array ) return v / 255
    if ( conf.ctor === Uint16Array ) return v / 65535
}

/** Reads bytes from a Uint8Array in chunks */
export function read( bytes: Uint8Array, n: number, byteCount: number ): number {
    const byteOffset = byteCount - 1 // should be on the layout ( pre-calc )
    const shift = byteOffset * 8 // should be on the layout ( pre-calc )
    const high = bytes[n + byteOffset] ?? 0
    const low = bytes[n] ?? 0
    return ((high << shift) | low) >>> 0
}

/** Maps: float -> [0.0, 1.0] */
export function f32map( v: number, max: number ): number {
    return v / max  // normalize
}

/** Maps a value x from [-inf, inf] -> [0, range] ... Preferred method 2026 */
export function mapint_v1( x: number, xmax: number, range: number ): number {
    // x : [-inf, inf] -> [-inf, inf] ( unbounded ratio )
    const ratio = x / xmax

    // x : [-inf, inf] -> [0, 1]
    const clamped = Math.min( Math.max( ratio, 0 ), 1 )

    // x : [0, 1] -> [0, range]
    return Math.floor( clamped * range )
}

/** Maps a value x from [-inf, inf] -> [0, range] */
export function mapint_v2( x: number, xmax: number, range: number ): number {
    // x : [-inf, inf] -> [-inf, inf] ( unbounded ratio )
    const ratio = x / xmax

    // x : [-inf, inf] -> [-inf, range] ... because Math.floor(-.5) -> -1
    const mapped = Math.floor( ratio * range )

    // x : [-Inf, range] -> [0, range]
    return Math.min( Math.max( mapped, 0 ), range )
}
