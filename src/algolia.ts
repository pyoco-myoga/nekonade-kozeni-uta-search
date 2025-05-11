import { algoliasearch } from 'algoliasearch';

export type AccompanimentType = 'KARAOKE' | 'ACOUSTIC' | 'ELECTRIC';
export type LengthType = 'SHORT' | 'FULL';

export type AlgoliaData = {
  id: string;
  artist: string;
  artistId: string;
  song: string;
  songId: string;
  videoId: string;
  startSec: number;
  endSec: number;
  recommended: boolean;
  accompaniment: AccompanimentType;
  length: LengthType;
  _tags: Array<string>;
};

export const ALGOLIA_APP_ID = 'NE2NPRWHAC';
export const ALGOLIA_SEARCH_KEY = 'ae7284b8a121ced2507958a3a9f9cd34';
export const ALGOLIA_SEARCH_INDEX = 'songs';
export const ALGOLIA_HITS_PER_PAGE = 100;

export const algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
