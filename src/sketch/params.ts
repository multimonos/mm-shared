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

export type RangeParam = {
    type: 'range'
    id: string
    label: string
    min: number
    max: number
    step: number
    value: number
}

export type SelectOptions = {
    value: string
    label: string
}

export type SelectOptionFetcher = () => Promise<SelectOptions>

export type SelectParam = {
    type: 'select'
    id: string
    label: string
    value?:string
    options: SelectOptions[] | SelectOptionFetcher
}

