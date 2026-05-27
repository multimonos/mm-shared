export function delay( ms: number ) {
    return new Promise( res => setTimeout( res, ms ) )
}

export function rdelay( min: number, max?: number ) {
    return delay( randint( min, max ) )
}

function randint( min: number, max?: number ): number {
    if ( max === undefined ) {
        max = min
        min = 0
    }
    return min + Math.ceil( Math.random() * (max - min) )
}