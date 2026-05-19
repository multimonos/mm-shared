import { DataBroker } from "../broker";


/**
 * Stores "windowSize" vectors for each sender.
 *
 * @param broker
 * @param windowSize
 * @param debug
 */
export function createDataWindow( broker: DataBroker, {
    windowSize = 2,
    debug = false
}: {
    windowSize?: number;
    debug?: boolean;
} = {} ) {

    // Data Channel
    const data = new Map<number, Uint8Array[]>()

    broker.onData( ( packet, senderId ) => {
        const window = data.get( senderId ) || []

        window.push( packet )

        if ( window.length > windowSize ) {
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

