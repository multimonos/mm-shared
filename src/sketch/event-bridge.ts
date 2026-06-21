import type { P5 } from "../p5-extended";

type SketchEvents = {
    'sketch:loaded': ( p: P5 ) => void
    'recorder:start': () => void
    'recorder:pause': () => void
}

export type SketchEventBridge = ReturnType<typeof createEventBridge>

export function createEventBridge() {

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