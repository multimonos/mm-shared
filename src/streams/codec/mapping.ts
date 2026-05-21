import { U16_MAX, U8_MAX } from "./codec";

/**
 * Generally,
 *
 * quant*   | x : [0, 1] -> [0, range]
 * squant*  | x : [-1, 1] -> [0, range]
 *
 * unorm*   | x : [0, range] -> [0, 1]
 * snorm*   | x : [0, range] -> [-1, 1]
 *
 * "u" is for "unsigned"
 * "s" is for "signed"
 */


/**
 * unsigned quantization
 *
 * x : [0.0, 1.0] -> [0, range]
 */
export function quant( v: number, range: number ): number {
    return quantize_v1( v, range )
}

/** x : [0.0, 1.0] -> [0, 255] */
export function quant8( v: number ): number {
    return quant( v, U8_MAX )
}

/** x : [0.0, 1.0] -> [0, 65535] */
export function quant16( v: number ): number {
    return quant( v, U16_MAX )
}


/**
 * signed quantization
 *
 * x : [-1.0, 1.0] -> [0, range]
 */
export function squant( v: number, range: number ): number {
    // x : [-1.0, 1.0] -> [0, range]
    const norm = (v + 1.0) * 0.5

    // x : [0, 1] -> [0, range]
    return quantize_v1( norm, range )
}

/** x : [-1.0, 1.0] -> [0, 255] */
export function squant8( v: number ): number {
    return squant( v, U8_MAX )
}

/** x : [-1.0, 1.0] -> [0, 65535] */
export function squant16( v: number ): number {
    return squant( v, U16_MAX )
}


/**
 * unsigned normalization
 *
 * Maps x : [0, range] -> [0.0, 1.0]
 */
export function unorm( v: number, range: number ): number {
    return v / range
}

/** Maps x : [0, 255] -> [0.0, 1.0] */
export function unorm8( v: number ): number {
    return unorm( v, U8_MAX )
}

/** Maps x : [0, 65535] -> [0.0, 1.0] */
export function unorm16( v: number ): number {
    return unorm( v, U16_MAX )
}


/**
 * signed normalization
 *
 * x : [0, range] -> [-1.0, 1.0]
 */
export function snorm( v: number, range: number ): number {
    // x : [0, range] -> [0, 1]
    const norm = v / range

    // x : [0, 1] -> [0, 2]
    const scaled = norm * 2

    // x : [0, 2] -> [-1, 1]
    return scaled - 1.0
}

/** x : [0, 255] -> [-1.0, 1.0] */
export function snorm8( v: number ): number {
    return snorm( v, U8_MAX )
}

/** x : [0, 65535] -> [-1.0, 1.0] */
export function snorm16( v: number ): number {
    return snorm( v, U16_MAX )
}


/** --- Support Functions --- **/


/** Maps x : [0, 1] -> [0, range] ... Preferred method 2026 */
export function quantize_v1( x: number, range: number ): number {
    // x : [-inf, inf] -> [0, 1]
    const clamped = Math.min( Math.max( x, 0 ), 1 )

    // x : [0, 1] -> [0, range]
    return Math.floor( clamped * range )
}

/** Maps x : [-inf, inf] -> [0, range] */
export function quantize_v2( x: number, range: number ): number {
    // x : [-inf, inf] -> [-inf, range] ... because Math.floor(-.5) -> -1
    const mapped = Math.floor( x * range )

    // x : [-inf, range] -> [0, range]
    return Math.min( Math.max( mapped, 0 ), range )
}
