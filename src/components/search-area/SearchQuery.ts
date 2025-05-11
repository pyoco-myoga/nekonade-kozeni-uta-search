export type SearchOptions = {
  fullOnly: boolean;
  recommendedOnly: boolean;
  favoriteOnly: boolean;
  accompaniment: 'KARAOKE_ONLY' | 'GUITAR_ONLY' | null;
  youtubeUrlOrVideoId: string | null;
};

export type SearchQuery = {
  query: string;
  options: SearchOptions;
};
