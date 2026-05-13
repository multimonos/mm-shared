import type P5 from "p5";
import { AudioInputApi } from "../audio/audio-input";
import { DataBroker } from "../streams/broker";
import { DataProducer } from "../streams/producer";

export type SketchRole = 'generator' | 'consumer'

export type SketchEventApi = {
    loaded: ( p: P5 ) => void;
    ended: ( p: P5 ) => void;
}

type BaseSketchContext = {
    p5: typeof P5;
    canvas: HTMLElement;
    notify: SketchEventApi;
    audio?: AudioInputApi;
}

export type ConsumerContext = BaseSketchContext & {
    broker?: DataBroker | undefined;
    producer?: never;
}

export type GeneratorContext = BaseSketchContext & {
    broker?: never;
    producer?: DataProducer | undefined;
}

export type SketchContext = ConsumerContext | GeneratorContext

export type SketchModule = {
    meta: Record<string, unknown>;
    create: ( context: SketchContext ) => Promise<P5>;
}
