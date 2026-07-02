import type { DataConnection } from "peerjs";
import type { DataProducer } from "../producer";

export function createPeerDataProducer( conn: DataConnection ): DataProducer {
    return {

        type: 'peer-producer',

        push( data ) {
            if ( ! conn.open ) return; // Never push to closed.
            conn.send( data );
            // console.log( 'producer.push', data )
        },

        sendData( bytes: Uint8Array ) {
            if ( ! conn.open ) return; // Never push to closed.
            conn.send( bytes );
            // console.log( 'producer.sendData', bytes )
        },

        sendMeta( meta: Record<string, unknown> ) {
            if ( ! conn.open ) return; // Never push to closed.
            conn.send( meta );
            // console.log( 'producer.sendMeta',meta )
        },
    }
}