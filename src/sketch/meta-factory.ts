import type { SketchMeta, SketchVariant } from "./meta";

export const defineSketchMeta = (
    {
        id = '', // a slug unique to this sketch
        type = 'p5js',
        name = '',
        description = '',
        status = 'draft', // draft or publish
        posterUrl = '',
        audioUrl = null,
        usePagination = false,
        permissions = {},
        tags = [],
        params = {}, // sketch params ... public api for defining ui select, range, toggles etc ...
        variants = [],
    } ) => (
    {
        id,
        type,
        name,
        description,
        status,
        posterUrl,
        audioUrl,
        permissions,
        tags,
        usePagination,
        params,
        variants: defineSketchVariants( variants )
    } as SketchMeta
)

export const defineSketchVariant = (
    {
        id = "001", // a hash or some kind of string unique to this sketch
        name = "v0", // mutable string
        audioUrl = "",
        params = {}, // key value pair dictionary
        isDefault = false,
    }
) => (
    {
        id,
        name,
        audioUrl,
        params,
        isDefault,
    } as SketchVariant
)


export function defineSketchVariants( variants: Partial<SketchVariant>[] ): SketchVariant[] {

    const v = variants.map( defineSketchVariant )

    // Set default ( required )
    const hasDefault = v.filter( x => x.isDefault === true ).length > 0
    if ( ! hasDefault && v.length ) v[0].isDefault = true

    return v
}

export function findVariant( variants: SketchVariant[], id: string ): SketchVariant | undefined {
    return variants.find( x => x.id === id )
}