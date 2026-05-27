import type { DataProducer } from "../producer"

export interface CompositeProducer extends DataProducer {
    register: ( producer: DataProducer ) => () => void;
    readonly targets: Set<DataProducer>;
    clear: () => void;
}

export function createCompositeProducer( producers: DataProducer[] = [] ): CompositeProducer {

    // Producers managed by this composite producer.
    const targets = new Set<DataProducer>();

    // Add any producers.
    producers.forEach( producer => targets.add( producer ) )

    setInterval( () => console.log( { targets } ), 3000 )

    return {

        type: 'composite-producer',

        register( producer: DataProducer ) {
            targets.add( producer )

            return () => {
                // teardown
                targets.delete( producer )
            }
        },

        clear() {
            targets.clear()
        },

        push( data ) {
            targets.forEach( target => target.push( data ) )
        },

        sendData( bytes ) {
            targets.forEach( target => target.sendData( bytes ) )
        },

        sendMeta( meta ) {
            targets.forEach( target => target.sendMeta( meta ) )
        },

        get targets() {
            return targets
        }
    }
}