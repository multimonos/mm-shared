import { AudioContext, type IAnalyserNode, type IAudioContext } from "standardized-audio-context";

export interface AudioInputApi {
    readonly ctx: IAudioContext | null;
    readonly analyser: IAnalyserNode<IAudioContext> | null;
    start: () => Promise<{ ctx: IAudioContext, analyser: IAnalyserNode<IAudioContext> }>
    stop: () => Promise<void>
}

declare global {
    interface Window {
        mmAudioInput?: AudioInputApi
    }
}

export function createAudioInput( fftSize = 1024 ) {

    // no window
    if ( typeof window === 'undefined' ) return;
    // already created
    if ( window.mmAudioInput ) return;

    let ctx: IAudioContext | null = null
    let stream: MediaStream | null = null
    let analyser: IAnalyserNode<IAudioContext> | null = null

    const api: AudioInputApi = {
        get ctx() {return ctx},

        get analyser() {return analyser},

        async start() {
            if ( ! ctx ) {
                ctx = new AudioContext()
            }

            if ( ctx.state === 'suspended' ) {
                await ctx.resume()
            }

            if ( ! stream?.active ) {
                stream = await navigator.mediaDevices.getUserMedia( { audio: true } )
                const source = ctx.createMediaStreamSource( stream )
                analyser = ctx.createAnalyser()
                analyser.fftSize = fftSize
                source.connect( analyser )
            }

            return {
                ctx: ctx as IAudioContext,
                analyser: analyser as IAnalyserNode<IAudioContext>
            }
        },

        async stop() {
            if ( stream ) {
                stream.getTracks().forEach( t => t.stop() )
                stream = null
            }
            if ( ctx ) {
                await ctx.suspend()
            }
        }
    }

    // set it
    window.mmAudioInput = api
}

export function getAudioInput(): AudioInputApi {
    if ( typeof window === 'undefined' || ! window.mmAudioInput ) {
        throw new Error( 'mmAudioInput not initialized' )
    }
    return window.mmAudioInput
}