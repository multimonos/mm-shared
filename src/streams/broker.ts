export interface DataBroker {

    id: string;

    type: 'broker';

    /** Receives data ... ingress */
    push( data: Uint8Array | Record<string, unknown> | string, senderId?: number ): void;

    /** Is data in correct wire format */
    canPush( data: unknown ): data is Uint8Array | string | Record<string, unknown>;

    /** Callback when broker receives Uint8Array data */
    onData( fn: ( bytes: Uint8Array, senderId: number ) => void ): () => void;

    /** Callback when broker receives json data */
    onMeta( fn: ( data: Record<string, unknown>, senderId: number ) => void ): () => void;

    /** Send data to the broker directly via broker instance */
    sendData( bytes: Uint8Array, senderId?: number ): void;

    /** Send metadata to the broker directly via broker instance */
    sendMeta( data: Record<string, unknown>, senderId?: number ): void;
}

export type BrokerOptions = {
    id?: string;
}

export function createDataBroker( options: BrokerOptions = {} ): DataBroker {

    const dataListeners = new Set<( bytes: Uint8Array, senderId: number ) => void>()
    const metaListeners = new Set<( data: Record<string, unknown>, senderId: number ) => void>()


    // Set or generate id.
    const id = options.id === undefined
        ? (typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString( 36 ).substring( 2, 11 ))
        : options.id

    // Api
    return {
        id,

        type: 'broker',

        canPush( data ): data is Uint8Array | string | Record<string, unknown> {
            return data instanceof Uint8Array || typeof data === 'string' || (typeof data === 'object' && data !== null)
        },

        push( data, senderId = 0 ) {
            if ( data instanceof Uint8Array || data instanceof ArrayBuffer ) {
                // only send uint8array
                const bytes = data instanceof ArrayBuffer ? new Uint8Array( data ) : data
                dataListeners.forEach( fn => fn( bytes, senderId ) )

            } else if ( typeof data === 'string' ) {
                // send strings as meta
                try {
                    metaListeners.forEach( fn => fn( JSON.parse( data ), senderId ) )
                } catch ( e ) {
                    console.warn( `Datastream got non-JSON string ... skipping data='${ data }'` )
                }
            } else {
                // meta send expects json
                metaListeners.forEach( fn => fn( data, senderId ) )
            }
        },

        sendData( bytes, senderId = 0 ) {
            dataListeners.forEach( fn => fn( bytes, senderId ) )
        },

        sendMeta( data, senderId = 0 ) {
            metaListeners.forEach( fn => fn( data, senderId ) )
        },

        onData( fn ) {
            dataListeners.add( fn )

            return () => {
                dataListeners.delete( fn )
            }
        },

        onMeta( fn ) {
            metaListeners.add( fn )

            return () => {
                metaListeners.delete( fn )
            }
        },
    }
}


function uniqueId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString( 36 ).substring( 2, 11 ); // Fallback string
}