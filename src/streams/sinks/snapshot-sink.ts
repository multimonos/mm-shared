import {DataBroker} from "../broker";

/**
 * Store a single vec for each sender only.
 *
 * @param broker
 */
export function createSnapshotSink( broker: DataBroker, {
    debug = false
}: {
    debug?: boolean
} = {} ) {
    // Data Channel : Raw bytes data from producer
    const data = new Map<number, Uint8Array>()

    // Save only the latest packet
    broker.onData( ( packet, senderId ) => {
        data.set( senderId, packet )
        // debug && console.log(`data: ${senderId}`,x)
    } )

    // Meta Channel : Application state via json
    const meta = new Map<number, Record<string, unknown>>()

    // Merge incoming meta with the existing
    broker.onMeta( ( info, senderId ) => {
        let current = meta.get( senderId )

        if ( ! current ) {
            current = {}
            meta.set( senderId, current )
        }

        Object.assign( current, info ) // Mutate existing instead of creating new

        debug && console.log( senderId, meta.get( senderId ) )
    } )

    return { data, meta }
}