import { SketchContext } from "./context";
import type P5 from "p5"

export type SketchModule = {
    meta: Record<string, unknown>;
    create: ( context: SketchContext ) => Promise<P5>;
}
