import type { P5 } from "../p5-extended"
import { type SketchFactoryContext } from "./context";
import type { SketchMeta } from "./meta";

export interface SketchModule {
    meta: SketchMeta,
    create: SketchFactory
}

export type SketchFactory = ( context: SketchFactoryContext ) => Promise<P5>
