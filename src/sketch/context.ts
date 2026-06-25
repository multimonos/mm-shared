import type { AudioInputApi, AudioPlayerApi } from "../audio";
import { type P5, type P5Constructor } from "../p5-extended"
import { DataBroker } from "../streams/broker";
import { DataProducer } from "../streams/producer";
import type { EventBus } from "../util/event-bus";
import type { SketchEvents } from "./events";
import type { SketchMeta } from "./meta";
import type { ProgressStepper } from "./progress-stepper";
import type { SketchRole } from "./role";

/** Sketch Module : Every sketch implements this basic contract*/
export interface SketchModule<C extends SketchFactoryContext = SketchFactoryContext> {
    meta: SketchMeta,
    create: SketchFactory<C>
}

/** Base Factory */
type BaseSketchFactoryContext = {
    p5: P5Constructor
    canvas: HTMLElement
    // notify?: SketchNotifier
}

/** Dependencies */
export type PlayerNotifier = {
    loaded: ( p: P5 ) => void;
    ended: ( p: P5 ) => void;
}


/** Factory : As a factory we are just injecting dependencies from the framework */
export type SketchFactory<C extends SketchFactoryContext = SketchFactoryContext>
    = ( context: C ) => Promise<P5>

type SketchFactoryContext = BaseSketchFactoryContext & {
    audio?: AudioPlayerApi | AudioInputApi
    broker?: DataBroker
    producer?: DataProducer
}

/**
 * PLAYER SYSTEM
 *
 * multimonos.com ( as of 25-may-2026 )
 */
export type PlayerContext = BaseSketchFactoryContext & {
    progress: ProgressStepper
    audio: AudioPlayerApi
    notify: PlayerNotifier
}

/**
 * RECORDER SYSTEM
 */
type BaseRecorderContext = BaseSketchFactoryContext & {
    role?: SketchRole,
    audio?: AudioInputApi
    bridge?: EventBus<SketchEvents>
}

/** Recorder : As a sketch we can assert which values we consume from the framework */
export type RecorderContext =
    | ConsumerContext
    | GeneratorContext
    | TransceiverContext

/** Consumer eats data to render */
export type ConsumerContext = BaseRecorderContext & {
    broker: DataBroker;
    producer?: DataProducer;
}

/** Generate data either numerical or audio */
export type GeneratorContext = BaseRecorderContext & {
    broker?: DataBroker;
    producer: DataProducer;
}

/** A consumer + generator */
export type TransceiverContext = BaseRecorderContext & {
    broker: DataBroker;
    producer: DataProducer;
}


