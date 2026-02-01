export interface AnimeCard {
  id: string;
  title: string;
  poster: string;
  type?: string;
  rating?: number;
}

export interface Episode {
  number: number;
  id: string;
  title: string;
}

export interface EpisodeSource {
  url: string;
  quality: string;
  isM3U8: boolean;
  type: string;
}
