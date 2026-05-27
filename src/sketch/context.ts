import { AudioInputApi } from "../audio/audio-input";
import { type P5, type P5Constructor } from "../p5-extended"
import { DataBroker } from "../streams/broker";
import { DataProducer } from "../streams/producer";

export type SketchContext =
    | ConsumerContext
    | GeneratorContext

type BaseSketchContext = {
    p5: P5Constructor;
    canvas: HTMLElement;
    notify: SketchNotifier;
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

export type TransceiverContext = BaseSketchContext & {
    broker?: never;
    producer?: DataProducer | undefined;
}

export type SketchNotifier = {
    loaded: ( p: P5 ) => void;
    ended: ( p: P5 ) => void;
}

