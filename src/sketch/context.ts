import { AudioInputApi } from "../audio/audio-input";
import { type P5, type P5Constructor } from "../p5-extended"
import { DataBroker } from "../streams/broker";
import { DataProducer } from "../streams/producer";

/** Core */
type BaseSketchContext = {
    p5: P5Constructor
    canvas: HTMLElement
    notify: SketchNotifier
    audio?: AudioInputApi
}

/** As a factory we are just injecting dependencies from the framework */
export type SketchFactoryContext = BaseSketchContext & {
    broker?: DataBroker
    producer?: DataProducer
}


/** As a sketch we can assert which values we consume from the framework */
export type SketchContext =
    | ConsumerContext
    | GeneratorContext
    | TransceiverContext

/** Sketch contexts */
export type ConsumerContext = BaseSketchContext & {
    broker: DataBroker; // required
    producer?: DataProducer; // optional
}

export type GeneratorContext = BaseSketchContext & {
    broker?: DataBroker; // optional
    producer: DataProducer; // required
}

export type TransceiverContext = BaseSketchContext & {
    broker: DataBroker;
    producer: DataProducer;
}


/** Dependencies */
export type SketchNotifier = {
    loaded: ( p: P5 ) => void;
    ended: ( p: P5 ) => void;
}

