export type AudioAsset = {
    id: string;
    type: 'audio',
    title: string;
    author: string;
    tags: string[];
    links: {
        source: string;
    }
}

export type GetAudioListResponse = {
    data: AudioAsset[]
}