type SketchEvents = {
    'sketch:loaded': () => void
    'recorder:start': () => void
    'recorder:pause': () => void
}


export type SketchEventBridgOptions = {
    debug?: boolean
}
export type SketchEventBridge = ReturnType<typeof createEventBridge>

export function createEventBridge( options: Partial<SketchEventBridgOptions> = {} ) {

    const {
        debug = true
    } = options

    const log = ( ...args: any ) => debug && console.log( 'event-bridge:', ...args )

    // internal api is "loosely" typed, but, public api is not
    let listeners: { [event: string]: Array<( ...args: any[] ) => void> } = {}

    function on<K extends keyof SketchEvents>( event: K, fn: SketchEvents[K] ) {
        if ( ! listeners[event] ) {
            listeners[event] = []
        }

        listeners[event].push( fn as ( ...args: any[] ) => void )

        // unsub
        return () => {
            if ( ! listeners[event] ) return;

            listeners[event] = listeners[event].filter(
                listener => listener !== fn
            )
        }
    }

    function emit<K extends keyof SketchEvents>( event: K, ...args: Parameters<SketchEvents[K]> ) {
        log( 'emit', event )
        listeners[event]?.forEach( fn => fn( ...args ) )
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