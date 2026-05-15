const limitCounts: Record<string, number> = {}
const sampleCounts: Record<string, number> = {}
const groupCounts: Record<string, number> = {}
const groupDumped: Record<string, boolean> = {}
const groupValues: Record<string, any> = {}

type ConsoleLogFunctions = 'log' | 'error' | 'warn' | 'info'

export function limit( max: number, key: string = '_' ) {

    if ( ! limitCounts[key] ) {
        limitCounts[key] = 0
    }

    const callfn = ( fn: ConsoleLogFunctions ) => ( ...args: any[] ) => {
        if ( ! console[fn] ) return;

        if ( limitCounts[key] < max ) {
            console[fn]( 'limit', `${ key } ${ limitCounts[key] }`, ...args )
            limitCounts[key]++
        }
    }

    return {
        log: callfn( 'log' ),
        error: callfn( 'error' ),
        warn: callfn( 'warn' ),
        info: callfn( 'info' ),
    }
};

export function sample( val: any, shouldSample: ( n?: number ) => boolean, key: string = '_' ) {
    if ( ! sampleCounts[key] ) {
        sampleCounts[key] = 0
    }

    if ( ! shouldSample( sampleCounts[key] ) ) return;

    console.log( `sample ${ key } ${ sampleCounts[key] }`, val )
    sampleCounts[key]++
}

export function collect(
    val: any,
    shouldCollect: ( n?: number ) => boolean = () => true,
    key: string = '_'
) {
    function until(
        shouldDump: ( n?: number ) => boolean = () => true
    ) {
        if ( ! shouldDump( groupCounts[key] ) ) return;
        if ( groupDumped[key] ) return;
        console.table( groupValues[key] )
        groupDumped[key] = true
    }

    const api = { until }

    if ( groupDumped[key] ) return api;

    if ( ! groupCounts[key] ) {
        groupCounts[key] = 0
        groupDumped[key] = false
        groupValues[key] = []
    }

    if ( ! shouldCollect( groupCounts[key] ) ) return;

    groupValues[key].push( { [key]: val } )
    // console.log( 'collect', { [key]: val } )
    groupCounts[key]++

    return api
}


export const logger = {
    limit,
    sample,
    collect,
}