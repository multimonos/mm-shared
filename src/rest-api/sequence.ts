export type Sequence =
    {
        id: string
        type: 'sequence',
        name: string
        names: string[]
        description: string
        links: {
            about: string
            data: string
            self: string
            collection: string
        },
        length: number
        S: string
    }

export type GetSequenceListResponse = {
    data: Sequence[]
    links: {
        self: string
    }
}

export type GetSequenceResponse = {
    data: Sequence
}