import { AnalyserNode, AudioContext, GainNode, MediaElementAudioSourceNode } from "standardized-audio-context";

export interface AudioPlayerApi {
    id: string;
    audioElement: HTMLAudioElement;
    audioContext: AudioContext;
    nodes: {
        source: MediaElementAudioSourceNode<AudioContext>;
        gain: GainNode<AudioContext>;
        analyser: AnalyserNode<AudioContext>;
    };

    /* url */
    getUrl: () => string;
    setUrl: ( url: string ) => void;

    /* tests */
    debug: () => void;
    isSuspended: () => boolean;
    isRunning: () => boolean;
    isPlaying: () => boolean;

    /* playback */
    seek: ( v: number ) => number;
    destroy: () => Promise<void>;
}