type SketchEvents = {
    'sketch:loaded': () => void
    'recorder:start': () => void
    'recorder:pause': () => void
}

export type SketchEventBridge = ReturnType<typeof createEventBridge>

export function createEventBridge() {

    let listeners: { [K in keyof SketchEvents]?: SketchEvents[K][] } = {}

    function on<K extends keyof SketchEvents>( event: K, fn: SketchEvents[K] ) {
        if ( ! listeners[event] ) {
            listeners[event] = []
        }
        listeners[event]!.push( fn )

        // unsub
        return () => {
            if ( ! listeners[event] ) return;
            listeners[event] = listeners[event]!.filter( listener => listener !== fn )
        }
    }

    function emit<K extends keyof SketchEvents>( event: K, ...args: Parameters<SketchEvents[K]> ) {
        listeners[event]?.forEach( fn => (fn as any)( ...args ) )
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