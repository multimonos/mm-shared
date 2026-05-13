export type SketchMeta = {
    id: string;
    name: string;
    status: 'publish' | 'draft';
    permissions: {
        microphone?: boolean;
    }
    tags: string[];
}