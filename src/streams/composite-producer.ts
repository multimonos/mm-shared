import type { DataProducer } from "./producer"

export interface CompositeProducer extends DataProducer {
    register: ( producer: DataProducer ) => () => void;
    clear: () => void;
}

export function createCompositeProducer( producers: DataProducer[] = [] ): CompositeProducer {

    const targets = new Set<DataProducer>();

    producers.forEach( producer => targets.add( producer ) )

    return {

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
    }
}