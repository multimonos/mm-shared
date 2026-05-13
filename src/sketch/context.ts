import type P5 from "p5";
import { AudioInputApi } from "../audio/audio-input";
import { DataBroker } from "../streams/broker";
import { DataProducer } from "../streams/producer";


type BaseSketchContext = {
    p5: typeof P5;
    canvas: HTMLElement;
    notify: SketchEventApi;
    audio?: AudioInputApi;
}

export type SketchEventApi = {
    loaded: ( p: P5 ) => void;
    ended: ( p: P5 ) => void;
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

