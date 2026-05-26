import { DataBroker } from "../broker";
import { DataSink } from "./datasink";

/**
 * Store a single vec for each sender only.
 *
 * @param broker
 */
export function createSnapshotSink( broker: DataBroker, {
    debug = false
}: {
    debug?: boolean
} = {} ): DataSink<Uint8Array> {

    // Channles
    const data = new Map<number, Uint8Array>()
    const meta = new Map<number, Record<string, unknown>>()

    // Data Channel : Raw bytes data from producer ... save only the latest packet
    broker.onData( ( bytes, senderId ) => {
        data.set( senderId, bytes )
    } )

    // Meta Channel : Application state via json ... merge incoming meta with the existing
    broker.onMeta( ( info, senderId ) => {
        let current = meta.get( senderId )

        if ( ! current ) {
            current = {}
            meta.set( senderId, current )
        }

        Object.assign( current, info ) // Mutate existing instead of creating new

        debug && console.log( { senderId, meta: meta.get( senderId ) } )
    } )


    function clearAll() {
        data.clear()
        meta.clear()
    }

    function clear( senderId: number ) {
        data.delete( senderId )
        meta.delete( senderId )
    }

    return {
        data,
        meta,
        clearAll,
        clear,
    }
}