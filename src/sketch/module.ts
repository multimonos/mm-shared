import type { P5 } from "../p5-extended"
import { SketchContext } from "./context";
import type { SketchMeta } from "./meta";

export interface SketchModule {
    meta: SketchMeta,
    create: ( context: SketchContext ) => Promise<P5>;
}
