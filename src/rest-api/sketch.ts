import type { SketchParams } from "../sketch/meta";

export type GetSketchListResponse = {
    data: SketchResponse[]
}

export type GetSketchResponse = {
    data: SketchResponse
}

export type SketchResponse = {
    id: string
    type: "sketch"
    version: string
    status: 'publish' | 'draft'
    permissions: Record<string, any>
    tags: string[],
    params: SketchParams
    links: {
        self: string
        source: string
        collection: string
    }
}