<script lang="ts" setup>
import AppBar from "@/components/app-bar/AppBar.vue";
import AppDrawer from "@/components/app-drawer/AppDrawer.vue";
import { useSongStore } from "@/store/song";
import { ref } from "vue";
import { computed } from "vue";

const store = useSongStore();
const currentPerformance = computed(() => {
  return store.getPlayingPerformance();
});

const drawer = ref(false);
</script>

<template>
  <v-app>
    <app-bar v-model:drawer="drawer" title="Nekonade Kozeni Uta Search" />
    <app-drawer v-model:drawer="drawer" />
    <v-main>
      <router-view />
    </v-main>

    <template v-if="currentPerformance !== null">
      <youtube-player
        :current-performance="currentPerformance"
        @close="
          () => {
            store.setPerformancePlaylist([]);
          }
        "
        @ended="store.playNextPlaylistPerformance"
        @next="store.playNextPlaylistPerformance"
        @previous="store.playPreviousPlaylistPerformance"
      />
    </template>
  </v-app>
</template>
