<script lang="ts" setup>
import { ref } from "vue";
import BaseSongCard from "./BaseSongCard.vue";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import { supabase } from "@/common";
import { type Playlist, usePlaylistsStore } from "@/store/playlists";
import type { Ref } from "vue";
import { useUserStore } from "@/store/user";
import { assertNotUndefined } from "@/utils";

const props = defineProps<{
  playlist: Playlist;
  trackOrder: number;
  isFavorite: boolean | null;
  isPlaying: boolean;
}>();
const emits = defineEmits<{
  click: [];
  "remove-from-playlist": [playlist: Playlist, trackOrder: number];
}>();

const shareYoutubeRef = ref<InstanceType<typeof ShareYoutube> | null>(null);

const thumbnailImageUrl = supabase.storage
  .from("thumbnails")
  .getPublicUrl(
    `thumbnails/${assertNotUndefined(props.playlist.playlistPerformances.get(props.trackOrder)).videoId}.jpg`
  ).data.publicUrl;

const playlistStore = usePlaylistsStore();
const userStore = useUserStore();
const selectedAddToPlaylist: Ref<string[]> = ref([]);
const showAddToPlaylistDialog = ref(false);

async function onClickAddToPlaylist() {
  if (userStore.user === null) {
    return;
  }
  for (const playlistId of selectedAddToPlaylist.value.values()) {
    const performanceId = props.playlist.playlistPerformances.get(props.trackOrder)?.id;
    if (performanceId === undefined) {
      console.error("failed to get playlist performance");
      continue;
    }
    const { error } = await supabase.rpc("insert_playlist_performance", {
      _performance_id: performanceId,
      _playlist_id: playlistId,
    });
    if (error !== null) {
      console.error(error);
    }
  }
  showAddToPlaylistDialog.value = false;
  selectedAddToPlaylist.value = [];
}
</script>

<template>
  <BaseSongCard
    :image-url="thumbnailImageUrl"
    :is-playing="props.isPlaying"
    :performance="assertNotUndefined(props.playlist.playlistPerformances.get(props.trackOrder))"
    @click="emits('click')"
  >
    <template v-if="playlist.type === 'user'" #post-icon>
      <template v-if="props.isFavorite !== null">
        <v-btn
          :elevation="0"
          icon="mdi-minus-circle-outline"
          @click.stop="emits('remove-from-playlist', props.playlist, props.trackOrder)"
        />
      </template>
    </template>
  </BaseSongCard>

  <ShareYoutube
    ref="shareYoutubeRef"
    :performance="assertNotUndefined(props.playlist.playlistPerformances.get(props.trackOrder))"
  />

  <v-dialog v-model="showAddToPlaylistDialog" persistent>
    <v-card prepend-icon="mdi-music" title="プレイリストへ追加">
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="{ id: playlistId, name: playlistName } in playlistStore.playlists?.values()"
            :key="playlistId"
            density="compact"
          >
            <v-checkbox v-model="selectedAddToPlaylist" :label="playlistName" :value="playlistId" />
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn text="キャンセル" @click="showAddToPlaylistDialog = false" />
        <v-btn text="追加" @click="onClickAddToPlaylist" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
