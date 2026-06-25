

export type EventBusOptions = {
    debug?: boolean
}

/** A generic event map that should be refined when factory called */
export type EventBusEventMap = Record<string, ( ...args: any[] ) => void>;

export interface EventBus<T extends EventBusEventMap> {
    on<K extends keyof T>( event: K, fn: T[K] ): () => void;
    emit<K extends keyof T>( event: K, ...args: Parameters<T[K]> ): void;
    destroy(): void;
}

export function createEventBus<T extends EventBusEventMap>(
    options: Partial<EventBusOptions> = {}
): EventBus<T> {

    const {
        debug = true
    } = options

    const log = ( ...args: any ) => debug && console.log( 'event-bridge:', ...args )

    // internal api is "loosely" typed, but, public api is not
    let listeners: { [event: string]: Array<( ...args: any[] ) => void> } = {}

    function on<K extends keyof T>( event: K, fn: T[K] ) {
        const eventId = event as string

        if ( ! listeners[eventId] ) {
            listeners[eventId] = []
        }

        listeners[eventId].push( fn as ( ...args: any[] ) => void )

        // unsub
        return () => {
            if ( ! listeners[eventId] ) return;

            listeners[eventId] = listeners[eventId].filter(
                listener => listener !== fn
            )
        }
    }

    function emit<K extends keyof T>( event: K, ...args: Parameters<T[K]> ) {
        log( 'emit', event )
        const eventId = event as string
        listeners[eventId]?.forEach( fn => fn( ...args ) )
    }

    function destroy() {
        listeners = {}
    }

    return {
        on,
        emit,
        destroy,
    }
}