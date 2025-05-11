<script lang="ts" setup>
import PlaylistSongCard from "@/components/song-card/PlaylistSongCard.vue";
import { useFavoritesStore } from "@/store/favorites";
import { type Playlist, usePlaylistsStore } from "@/store/playlists";
import { useSongStore } from "@/store/song";
import { useTheme } from "vuetify/lib/composables/theme.mjs";

const show = defineModel<boolean>("show", { required: true });
const props = defineProps<{
  playlist: Playlist;
}>();
const emits = defineEmits<{
  play: [];
}>();
const favoriteStore = useFavoritesStore();
const playlistStore = usePlaylistsStore();
const songStore = useSongStore();
const theme = useTheme();
</script>

<template>
  <v-dialog v-model="show" height="80%" max-height="80vh">
    <v-card
      :style="{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }"
    >
      <v-toolbar
        :style="{
          color: theme.current.value.colors['on-primary'],
          backgroundColor: theme.current.value.colors.primary,
        }"
      >
        <template v-slot:title>
          <span class="font-weight-bold">
            {{ props.playlist.name }}
          </span>
        </template>
        <template v-slot:prepend>
          <v-btn
            :style="{
              color: theme.current.value.colors['on-background'],
              backgroundColor: theme.current.value.colors.secondary,
            }"
            icon="mdi-play"
            @click.stop="emits('play')"
          />
        </template>
        <template v-slot:append>
          <v-btn :elevation="0" icon="mdi-close-circle" @click.stop="show = false" />
        </template>
      </v-toolbar>
      <v-card-text
        :style="{
          backgroundColor: theme.current.value.colors.background,
          flex: 1,
          overflowY: 'auto',
        }"
      >
        <div class="mb-4">
          {{ props.playlist.description }}
        </div>
        <template
          v-for="[trackOrder, performance] of props.playlist.playlistPerformances.entries()"
          :key="performance.id"
        >
          <PlaylistSongCard
            :track-order="trackOrder"
            :is-favorite="favoriteStore.isFavorite(performance)"
            :is-playing="false"
            :playlist="playlist"
            @click="
              songStore.setPerformancePlaylist(Array.from(playlist.playlistPerformances.values()));
              songStore.playNextPlaylistPerformance(trackOrder);
            "
            @remove-from-playlist="playlistStore.removeFromPlaylist(playlist.id, trackOrder)"
          />
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
