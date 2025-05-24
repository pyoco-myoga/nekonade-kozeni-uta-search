<script lang="ts" setup>
import { usePlaylistsStore, type Playlist } from "@/store/playlists";
import { ref } from "vue";
import PlaylistSongList from "@/components/playlist-song-list/PlaylistSongList.vue";
import BottomMenu from "@/components/bottom-menu/BottomMenu.vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import PlaylistFormDialog from "../playlist-form/PlaylistFormDialog.vue";
const showSongList = ref(false);
const emits = defineEmits<{ play: [] }>();
const props = defineProps<{
  playlist: Playlist;
}>();
const showBottomMenu = ref(false);
const showPlaylistEditForm = ref(false);

const playlistsStore = usePlaylistsStore();

const theme = useTheme();
const bottomMenuTiles = [
  ...(props.playlist.type === "user"
    ? [
        {
          icon: "mdi-pencil",
          color: theme.current.value.colors.primary,
          title: "edit",
          click: async () => {
            showPlaylistEditForm.value = true;
          },
          requiredLogin: true,
        },
        {
          icon: "mdi-trash-can",
          color: theme.current.value.colors.error,
          title: "delete",
          click: async () => {
            await playlistsStore.deletePlaylist({ playlistId: props.playlist.id });
          },
          requiredLogin: true,
        },
      ]
    : []),
];
</script>

<template>
  <v-card class="mx-auto" elevation="2" @click="showSongList = true">
    <v-sheet class="d-flex" height="80">
      <div class="d-flex me-3">
        <v-btn
          elevation="0"
          height="100%"
          :style="{
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }"
          @click.stop="emits('play')"
        >
          <v-icon icon="mdi-play" size="x-large" />
        </v-btn>
      </div>
      <div class="d-flex flex-column flex-grow-1 overflow-hidden justify-center">
        <v-list-item-title class="overflow-hidden custom-title-style">
          {{ props.playlist.name }}
        </v-list-item-title>
        <v-list-item-subtitle class="overflow-hidden" style="white-space: nowrap">
          {{ props.playlist.description }}
        </v-list-item-subtitle>
      </div>
      <div class="d-flex align-center">
        <slot name="post-icon" />
        <template v-if="bottomMenuTiles.length !== 0">
          <v-btn @click.stop="showBottomMenu = true" :elevation="0" icon="mdi-dots-vertical" />
        </template>
      </div>
    </v-sheet>
  </v-card>
  <PlaylistSongList v-model:show="showSongList" :playlist="props.playlist" @play="emits('play')" />
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
  <BottomMenu v-model:show="showBottomMenu" :tiles="bottomMenuTiles" />
</template>
