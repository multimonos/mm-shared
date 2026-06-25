import { type EventBusEventMap } from "../util/event-bus";

export interface SketchEvents extends EventBusEventMap {
    'sketch:loaded': () => void
    'recorder:start': () => void
    'recorder:pause': () => void
}
