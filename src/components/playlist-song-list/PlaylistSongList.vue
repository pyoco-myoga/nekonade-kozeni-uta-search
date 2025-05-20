<script lang="ts" setup>
import PlaylistSongCard from "@/components/song-card/PlaylistSongCard.vue";
import { useFavoritesStore } from "@/store/favorites";
import { type Playlist, usePlaylistsStore } from "@/store/playlists";
import { useSongStore } from "@/store/song";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import { VueDraggable } from "vue-draggable-plus";
import { ref } from "vue";
import { watch } from "vue";
import type { AlgoliaData } from "@/algolia";

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

const playlistPerformanceList = ref<Array<AlgoliaData>>([]);
watch(
  () => props.playlist.playlistPerformances,
  () => {
    playlistPerformanceList.value = Array.from(props.playlist.playlistPerformances.entries())
      .sort(([order1], [order2]) => order1 - order2)
      .map(([_, performance]) => performance);
  },
  { deep: true, immediate: true }
);

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
        <VueDraggable
          v-model="playlistPerformanceList"
          :animation="150"
          @end="
            async (e) => {
              if (e.oldIndex === undefined || e.newIndex === undefined) {
                console.error('error');
                return;
              }
              await playlistStore.reorderPlaylist({
                playlistId: props.playlist.id,
                fromIndex: e.oldIndex,
                toIndex: e.newIndex,
              });
            }
          "
          handle=".handle"
        >
          <template
            v-for="(performance, trackOrder) of playlistPerformanceList"
            :key="performance.id"
          >
            <PlaylistSongCard
              :performance="performance"
              :playlist-type="playlist.type"
              :is-favorite="favoriteStore.isFavorite(performance)"
              :is-playing="false"
              @click="
                songStore.setPerformancePlaylist(
                  Array.from(playlist.playlistPerformances.values())
                );
                songStore.playNextPlaylistPerformance(trackOrder);
              "
              @remove-from-playlist="playlistStore.removeFromPlaylist(playlist.id, trackOrder)"
            >
              <template v-if="playlist.type === 'user'" #hundle>
                <v-icon class="handle" icon="mdi-menu" />
              </template>
            </PlaylistSongCard>
          </template>
        </VueDraggable>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
