import type { AlgoliaData } from '@/algolia';
import { defineStore } from 'pinia';
import { type Ref, ref } from 'vue';

export const useSongStore = defineStore('song', () => {
  const performacePlaylist: Ref<Array<AlgoliaData>> = ref([]);
  const playingIndex: Ref<number | null> = ref(null);

  function getPlayingPerformance (): AlgoliaData | null {
    if (playingIndex.value === null) {
      return null;
    } else {
      return performacePlaylist.value[playingIndex.value];
    }
  }

  function playNextPlaylistPerformance (index: number | null = null) {
    if (index !== null) {
      playingIndex.value = index;
    } else if (playingIndex.value === null) {
      playingIndex.value = 0;
    } else if (playingIndex.value + 1 >= performacePlaylist.value.length) {
      playingIndex.value = null;
    } else {
      playingIndex.value++;
    }
  }

  function playPreviousPlaylistPerformance () {
    if (playingIndex.value === null) {
      return;
    } else if (playingIndex.value <= 0) {
      playingIndex.value = null;
    } else {
      playingIndex.value--;
    }
  }

  function setPerformancePlaylist (playlist: Array<AlgoliaData>) {
    performacePlaylist.value = playlist;
    playingIndex.value = null;
  }

  return {
    getPlayingPerformance,
    playNextPlaylistPerformance,
    playPreviousPlaylistPerformance,
    setPerformancePlaylist,
  };
});
