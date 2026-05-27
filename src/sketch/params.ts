export type SketchParam = RangeParam | SelectParam

export type SketchParams = {
    [key: string]: SketchParam
}

type ParamValueTypeMap = {
    range: number
    select: string
}

export type ParamChangeHandler = <P extends SketchParam>(
    param: P,
    newValue: ParamValueTypeMap[P['type']]
) => void

/** Range */
export type RangeParam = {
    type: 'range'
    id: string
    label: string
    value: number
    min: number
    max: number
    step: number
}

/** Select */
export type Option = {
    value: string
    label: string
}

export type SelectParam = {
    type: 'select'
    id: string
    label: string
    value?: string
    options: Option[] | (() => Promise<Option[]>)
}

