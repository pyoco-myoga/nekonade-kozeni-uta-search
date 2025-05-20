<script lang="ts" setup>
import PlaylistFormDialog from "@/components/playlist-form/PlaylistFormDialog.vue";
import PlaylistCard from "@/components/playlist-card/PlaylistCard.vue";
import { generatePlaylist, usePlaylistsStore, type Playlist } from "@/store/playlists";
import { useUserStore } from "@/store/user";
import type { Ref } from "vue";
import { onMounted, ref } from "vue";
import { useSongStore } from "@/store/song";
import { useFavoritesStore } from "@/store/favorites";
import { computedAsync } from "@vueuse/core";
import { computed } from "vue";
import Fuse from "fuse.js";
import { supabase } from "@/common";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const playlistsStore = usePlaylistsStore();
const favoritesStore = useFavoritesStore();

const tab: Ref<"private" | "official"> = ref(userStore.user === null ? "official" : "private");
const searchQuery: Ref<string> = ref("");

const showPlaylistForm = ref(false);

const songStore = useSongStore();

const allPrivatePlaylists = computedAsync(async () => {
  const { playlists } = storeToRefs(playlistsStore);
  const currentPlaylists = Array.from(playlists.value?.values() ?? []);
  const favoritePlaylist = await favoritesStore.getFavoritePlaylist();
  return [...(favoritePlaylist !== null ? [favoritePlaylist] : []), ...currentPlaylists];
}, []);

const privateFuse = computed(() => {
  return new Fuse(allPrivatePlaylists.value, {
    shouldSort: true,
    threshold: 0.4,
    keys: ["name", "description"],
  });
});
const searchedPrivatePlaylists = computed(() => {
  if (searchQuery.value === "") {
    return allPrivatePlaylists.value;
  } else {
    return privateFuse.value.search(searchQuery.value).map(({ item }) => item);
  }
});

const allPublicPlaylists = ref<Playlist[]>([]);
onMounted(async () => {
  let playlists = [];
  {
    const { data, error } = await supabase
      .from("performances")
      .select(`id`)
      .eq("accompaniment", "KARAOKE");
    if (error !== null) {
      throw error;
    }
    playlists.push(
      await generatePlaylist({
        id: "karaoke-accompaniment",
        name: "カラオケ",
        description: "カラオケプレイリスト",
        performanceIds: data.map(({ id }) => id),
      })
    );
  }
  {
    const { data, error } = await supabase
      .from("performances")
      .select(`id`)
      .eq("accompaniment", "ELECTRIC");
    if (error !== null) {
      throw error;
    }
    if (data.length !== 0) {
      playlists.push(
        await generatePlaylist({
          id: "electric-accompaniment",
          name: "エレキ弾き語り",
          description: "エレキギター弾き語りプレイリスト",
          performanceIds: data.map(({ id }) => id),
        })
      );
    }
  }
  {
    const { data, error } = await supabase
      .from("performances")
      .select(`id`)
      .eq("accompaniment", "ACOUSTIC");
    if (error !== null) {
      throw error;
    }
    if (data.length !== 0) {
      playlists.push(
        await generatePlaylist({
          id: "accoustic-accompaniment",
          name: "アコギ弾き語り",
          description: "アコギ弾き語りプレイリスト",
          performanceIds: data.map(({ id }) => id),
        })
      );
    }
  }
  allPublicPlaylists.value = playlists;
});

const publicFuse = computed(() => {
  return new Fuse(allPublicPlaylists.value, {
    shouldSort: true,
    threshold: 0.4,
    keys: ["name", "description"],
  });
});
const searchedPublicPlaylists = computed(() => {
  if (publicFuse.value === null || searchQuery.value === "") {
    return allPublicPlaylists.value;
  } else {
    return publicFuse.value.search(searchQuery.value).map(({ item }) => item);
  }
});
</script>

<template>
  <v-tabs v-model="tab" fixed-tabs>
    <template v-if="userStore.isLoggedIn()">
      <v-tab value="private"> PRIVATE </v-tab>
    </template>
    <v-tab value="official"> OFFICIAL </v-tab>
  </v-tabs>

  <v-container>
    <v-row align="center">
      <v-col>
        <v-text-field
          v-model="searchQuery"
          append-inner-icon="mdi-close"
          density="compact"
          hide-details
          label="プレイリスト名"
          prepend-inner-icon="mdi-magnify"
          single-line
          variant="solo"
          @click:append-inner="searchQuery = ''"
        />
      </v-col>
      <template v-if="userStore.isLoggedIn()">
        <v-col cols="auto">
          <v-btn icon="mdi-plus" @click="showPlaylistForm = true" />
        </v-col>
      </template>
    </v-row>
  </v-container>

  <v-window v-model="tab">
    <template v-if="userStore.isLoggedIn()">
      <v-window-item value="private">
        <template v-for="playlist of searchedPrivatePlaylists" :key="playlist.id">
          <PlaylistCard
            :playlist="playlist"
            @play="
              () => {
                songStore.setPerformancePlaylist(
                  Array.from(playlist.playlistPerformances.values())
                );
                songStore.playNextPlaylistPerformance();
              }
            "
          />
        </template>
      </v-window-item>
    </template>
    <v-window-item value="official">
      <template v-for="playlist of searchedPublicPlaylists">
        <PlaylistCard
          :playlist="playlist"
          @play="
            () => {
              songStore.setPerformancePlaylist(Array.from(playlist.playlistPerformances.values()));
              songStore.playNextPlaylistPerformance();
            }
          "
        />
      </template>
    </v-window-item>
  </v-window>

  <PlaylistFormDialog v-model:show="showPlaylistForm" />
</template>
