<script lang="ts" setup>
import PlaylistSongCard from "@/components/song-card/PlaylistSongCard.vue";
import { type Playlist } from "@/store/playlists";
import { useSongStore } from "@/store/song";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
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

const showPlaylistEditForm = ref(false);

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
          <span class="d-flex align-center font-weight-bold">
            <v-icon icon="mdi-music" />
            {{ props.playlist.name }}
          </span>
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
        <v-row>
          <v-col>
            <v-btn
              :style="{
                color: theme.current.value.colors['on-background'],
                backgroundColor: theme.current.value.colors.secondary,
              }"
              icon="mdi-pencil"
              @click="showPlaylistEditForm = true"
            />
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn
              :style="{
                color: theme.current.value.colors['on-background'],
                backgroundColor: theme.current.value.colors.secondary,
              }"
              icon="mdi-play"
              @click="emits('play')"
            />
          </v-col>
        </v-row>
        <div class="ma-4">
          {{ props.playlist.description }}
        </div>
        <template
          v-for="(performance, trackOrder) of playlistPerformanceList"
          :key="performance.id"
        >
          <PlaylistSongCard
            :performance="performance"
            :playlist-type="playlist.type"
            :is-playing="false"
            @click="
              songStore.setPerformancePlaylist(Array.from(playlist.playlistPerformances.values()));
              songStore.playNextPlaylistPerformance(trackOrder);
            "
          >
          </PlaylistSongCard>
        </template>
      </v-card-text>
    </v-card>
  </v-dialog>

  <PlaylistFormDialog
    v-model:show="showPlaylistEditForm"
    :playlist="{
      id: props.playlist.id,
      name: props.playlist.name,
      description: props.playlist.description,
      public: props.playlist.public,
      playlistPerformances: props.playlist.playlistPerformances,
      type: props.playlist.type,
    }"
  />
</template>
