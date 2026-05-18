export interface DataBroker {
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

export function createDataBroker(): DataBroker {
    let onDataCallback: (( bytes: Uint8Array, senderId: number ) => void) | null = null
    let onMetaCallback: (( data: Record<string, unknown>, senderId: number ) => void) | null = null

    return {

        canPush( data ): data is Uint8Array | string | Record<string, unknown> {
            return data instanceof Uint8Array || typeof data === 'string' || (typeof data === 'object' && data !== null)
        },

        push( data, senderId = 0 ) {
            if ( data instanceof Uint8Array || data instanceof ArrayBuffer ) {
                // only send uint8array
                onDataCallback?.(
                    data instanceof ArrayBuffer ? new Uint8Array( data ) : data,
                    senderId
                )
            } else if ( typeof data === 'string' ) {
                // send strings as meta
                try {
                    onMetaCallback?.( JSON.parse( data ), senderId )
                } catch ( e ) {
                    console.warn( `Datastream got non-JSON string ... skipping data='${ data }'` )
                }
            } else {
                // meta send expects json
                onMetaCallback?.( data, senderId )
            }
        },

        sendData( bytes, senderId = 0 ) {
            onDataCallback?.( bytes, senderId )
        },

        sendMeta( data, senderId = 0 ) {
            onMetaCallback?.( data, senderId )
        },

        onData( fn ) {
            onDataCallback = fn

            return () => {
                if ( onDataCallback === fn ) onDataCallback = null;
            }
        },

        onMeta( fn ) {
            onMetaCallback = fn

            return () => {
                if ( onMetaCallback === fn ) onMetaCallback = null;
            }
        },
    }
}


