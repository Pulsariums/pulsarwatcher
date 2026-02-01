export interface SearchResult {
    id: string;
    title: string;
    poster?: string;
    type?: string;
    episodes?: {
        sub?: number;
        dub?: number;
    };
}

export interface AnimeInfo {
    id: string;
    title: string;
    titleEnglish?: string;
    titleJapanese?: string;
    poster?: string;
    description?: string;
    type?: string;
    status?: string;
    rating?: string;
    genres?: string[];
    episodes?: Episode[];
    totalEpisodes?: number;
}

export interface Episode {
    number: number;
    id: string;
    title?: string;
}

export interface VideoSource {
    url: string;
    quality: string;
    isM3U8?: boolean;
    type: "video" | "iframe";
}

export interface EpisodeSources {
    sources: VideoSource[];
    subtitles?: Subtitle[];
}

export interface Subtitle {
    url: string;
    lang: string;
}

export interface ScraperResponse<T = any> {
    provider: string;
    status: number;
    data?: T;
    error?: string;
    message?: string;
}
