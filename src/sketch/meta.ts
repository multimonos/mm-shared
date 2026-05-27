/** SketchMeta */
export type SketchMeta = {
    id: string;
    type: SketchType,
    name: string;
    description: string;
    status: 'publish' | 'draft';
    params: SketchParams,
    tags: string[];
    permissions: {
        microphone?: boolean;
    }
}

/** Type */
export type SketchType =
    | 'p5js'

/** Params */
export type SketchParam =
    | RangeParam
    | SelectParam

export type SketchParams = {
    [key: string]: SketchParam
}

export type SketchParamChangeHandler = {
    ( param: RangeParam, newValue: number ): void;
    ( param: SelectParam, newValue: string ): void;
}

export type ParamOption = {
    value: string
    label: string
}

/** RangeParam */
export type RangeParam = {
    type: 'range'
    id: string
    label: string
    value: number
    min: number
    max: number
    step: number
}


/** SelectParam */
export type SelectParam = {
    type: 'select'
    id: string
    label: string
    value?: string
    options: ParamOption[] | (() => Promise<ParamOption[]>)
}

