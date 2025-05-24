<script lang="ts" setup>
import {
  ALGOLIA_HITS_PER_PAGE,
  ALGOLIA_SEARCH_INDEX,
  algoliaClient,
  type AlgoliaData,
} from "@/algolia";
import SearchArea from "@/components/search-area/SearchArea.vue";
import debounce from "lodash.debounce";
import type { SearchQuery } from "@/components/search-area/SearchQuery";
import { ref, watch } from "vue";
import SongCard from "@/components/song-card/SongCard.vue";
import type { SearchResponse } from "algoliasearch";
import { v4 as uuidv4 } from "uuid";
import { useSongStore } from "@/store/song";
import { useUserStore } from "@/store/user";
import { supabase } from "@/common";
import { useFavoritesStore } from "@/store/favorites";
import { match } from "ts-pattern";

const params = new URLSearchParams(location.search);
const searchQuery = ref<SearchQuery>({
  query: params.get("q") || "",
  options: {
    fullOnly: false,
    recommendedOnly: false,
    favoriteOnly: false,
    accompaniment: null,
    youtubeUrlOrVideoId: params.get("v") || "",
  },
});

const searchId = ref(uuidv4()); // update if new keyword search
const page = ref(0);

const DEBOUNCE_MILLI_SECONDS = 150;

function extractVideoId(youtubeUrlOrVideoId: string): string | null {
  const IS_VIDEOID_REGEX = /^[a-zA-Z0-9_-]{11}$/;
  if (IS_VIDEOID_REGEX.test(youtubeUrlOrVideoId)) {
    return youtubeUrlOrVideoId;
  }

  try {
    const youtubeURL = new URL(youtubeUrlOrVideoId);

    if (youtubeURL.pathname == "/watch") {
      const videoId = youtubeURL.searchParams.get("v");
      return videoId ?? null;
    } else {
      const mayVideoId = youtubeURL.pathname.split("/").at(-1);
      if (mayVideoId === undefined) {
        return null;
      } else {
        if (IS_VIDEOID_REGEX.test(mayVideoId)) {
          return mayVideoId;
        } else {
          return null;
        }
      }
    }
  } catch (e) {
    return null;
  }
}

async function search(
  searchQuery: SearchQuery,
  page: number = 0
): Promise<SearchResponse<AlgoliaData>> {
  return await algoliaClient.searchSingleIndex<AlgoliaData>({
    indexName: ALGOLIA_SEARCH_INDEX,
    searchParams: {
      query: searchQuery.query,
      hitsPerPage: ALGOLIA_HITS_PER_PAGE,
      page,
      filters:
        searchQuery.options.favoriteOnly && favoriteStore.favorites !== null
          ? favoriteStore.favorites.map((uuid) => `objectID:${uuid}`).join(" OR ")
          : "",
      facets: ["recommended", "length", "accompaniment", "videoId"],
      facetFilters: [
        ...(searchQuery.options.recommendedOnly ? ["recommended:true"] : []),
        ...(searchQuery.options.fullOnly ? ["length:FULL"] : []),
        ...match(searchQuery.options.accompaniment)
          .with("GUITAR_ONLY", () => [["accompaniment:ELECTRIC", "accompaniment:ACCOUSTIC"]])
          .with("KARAOKE_ONLY", () => ["accompaniment:KARAOKE"])
          .otherwise(() => []),
        ...(searchQuery.options.youtubeUrlOrVideoId
          ? [`videoId:${extractVideoId(searchQuery.options.youtubeUrlOrVideoId)}`]
          : []),
      ],
    },
  });
}
async function load(context: {
  done: (status: "error" | "loading" | "empty" | "ok") => void;
}): Promise<void> {
  try {
    const response = await search(searchQuery.value, page.value);
    if (response.hits.length === 0) {
      context.done("empty");
    } else {
      searchResults.value.hits.push(...response.hits);
      page.value++;
      context.done("ok");
    }
  } catch (e) {
    context.done("error");
    throw e;
  }
}

const searchResults = ref<{ hits: AlgoliaData[] }>({ hits: [] });

let latestSearchId = "";
watch(
  searchQuery,
  debounce(async (newQuery: SearchQuery) => {
    page.value = 0;

    const currentSearchId = uuidv4();
    latestSearchId = currentSearchId;

    const result = await search(newQuery, page.value);
    if (latestSearchId !== currentSearchId) {
      return;
    }
    searchResults.value = result;
    searchId.value = currentSearchId;
    page.value = 1;
  }, DEBOUNCE_MILLI_SECONDS),
  { deep: true }
);

const songStore = useSongStore();
const userStore = useUserStore();
const favoriteStore = useFavoritesStore();

async function addFavorite(performance: AlgoliaData) {
  if (!favoriteStore.isFavoritesSubscribed) {
    return;
  }
  if (userStore.user === null) {
    return;
  }
  const { error } = await supabase.from("favorites").insert({
    user_id: userStore.user.id,
    performance_id: performance.id,
  });
  if (error !== null) {
    throw error;
  }
}

async function removeFavorite(performance: AlgoliaData) {
  if (!favoriteStore.isFavoritesSubscribed) {
    return;
  }
  if (userStore.user === null) {
    return;
  }
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userStore.user.id)
    .eq("performance_id", performance.id);
  if (error !== null) {
    throw error;
  }
}
</script>

<template>
  <SearchArea v-model:search-query="searchQuery" :is-logged-in="userStore.isLoggedIn()" />
  <v-infinite-scroll :key="searchId" style="display: block; overflow: visible" @load="load">
    <template v-for="performance in searchResults.hits" :key="performance.id">
      <SongCard
        :is-favorite="favoriteStore.isFavorite(performance)"
        :is-playing="false"
        :performance="performance"
        @add-favorite="addFavorite(performance)"
        @click="
          () => {
            songStore.setPerformancePlaylist([performance]);
            songStore.playNextPlaylistPerformance();
          }
        "
        @remove-favorite="removeFavorite(performance)"
      />
    </template>

    <template #loading>
      <v-progress-circular indeterminate />
    </template>
    <template #empty />
  </v-infinite-scroll>
</template>
