import { DataBroker } from "../broker";
import { DataSink } from "./datasink";


/**
 * Stores "size" frames of vectors for each sender.
 *
 * @param broker
 * @param size
 * @param debug
 */
export function createWindowSink( broker: DataBroker, {
    size = 2,
    debug = false
}: {
    size?: number; // width of the window in indices
    debug?: boolean;
} = {} ):DataSink<Uint8Array[]> {

    // Channels
    const data = new Map<number, Uint8Array[]>()
    const meta = new Map<number, Record<string, unknown>>()

    // Data channel
    broker.onData( ( packet, senderId ) => {
        const window = data.get( senderId ) || []

        window.push( packet )

        if ( window.length > size ) {
            window.shift()
        }

        data.set( senderId, window )
    } )

    // Meta Channel: Merge incoming meta with the old for each sender
    broker.onMeta( ( info, senderId ) => {
        let current = meta.get( senderId )

        if ( ! current ) {
            current = {}
            meta.set( senderId, current )
        }

        Object.assign( current, info )

        debug && console.log( { meta: meta.get( senderId ) } )
    } )

    function clearAll() {
        data.clear()
        meta.clear()
    }

    function clear(senderId:number){
        data.delete(senderId)
        meta.delete(senderId)
    }

    return {
        data,
        meta,
        clearAll,
        clear,
    }
}

