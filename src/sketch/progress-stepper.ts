export interface ProgressStepper {
    /** get current progress */
    readonly value: number;
    /** set value of progress ... clamped to [0.0, 1.0] */
    update: ( value: number ) => void;
    /** reset to 0.0 */
    reset: () => void;
    /** set to 1.0 */
    done: () => void;
    /** cleanup */
    destroy: () => void;
}