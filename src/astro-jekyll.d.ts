export interface JekyllCollectionEntry {
    slug: string;
    collection: string;
    data: {
        date: Date,
        pubDate: Date,
        title: string,
        permalink?: string,
        category?: string,
        categories?: Array<string>,
        tags?: Array<string>
    }
}
