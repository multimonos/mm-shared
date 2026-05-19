import { DataBroker } from "../broker";


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
} = {} ) {

    // Data Channel
    const data = new Map<number, Uint8Array[]>()

    broker.onData( ( packet, senderId ) => {
        const window = data.get( senderId ) || []

        window.push( packet )

        if ( window.length > size ) {
            window.shift()
        }

        data.set( senderId, window )
    } )


    // Meta Channel
    const meta = new Map<number, Record<string, unknown>>()

    // Merge incoming meta with the old for each sender
    broker.onMeta( ( info, senderId ) => {
        let current = meta.get( senderId )

        if ( ! current ) {
            current = {}
            meta.set( senderId, current )
        }

        Object.assign( current, info )

        debug && console.log( { meta: meta.get( senderId ) } )
    } )

    return { data, meta }
}

