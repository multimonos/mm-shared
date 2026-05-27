import type { DataProducer } from "../producer";
import type { DataConnection } from "peerjs";

export function createPeerDataProducer( conn: DataConnection ): DataProducer {
    return {

        type: 'peer-producer',

        push( data ) {
            conn.send( data );
            // console.log( 'producer.push', data )
        },

        sendData( bytes: Uint8Array ) {
            conn.send( bytes );
            // console.log( 'producer.sendData', bytes )
        },

        sendMeta( meta:Record<string, unknown> ) {
            conn.send( meta );
            // console.log( 'producer.sendMeta',meta )
        },
    }
}