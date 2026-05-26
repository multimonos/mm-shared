import { DataBroker } from "../broker";
import { DataProducer } from "../producer";

export function createLoopbackProducer( broker: DataBroker ): DataProducer {
    return {
        push( data ) {
            broker.push( data )
        },

        sendData( bytes: Uint8Array ) {
            broker.sendData( bytes )
        },

        sendMeta( meta: Record<string, unknown> ) {
            broker.sendMeta( meta )
        }
    }
}