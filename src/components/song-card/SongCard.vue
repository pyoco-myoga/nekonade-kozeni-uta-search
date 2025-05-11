<script lang="ts" setup>
import { ref } from "vue";
import BaseSongCard from "./BaseSongCard.vue";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import type { AlgoliaData } from "@/algolia";
import { getYoutubeThumnailUrl, getYoutubeUrl } from "@/utils";
import { supabase } from "@/common";
import { usePlaylistsStore } from "@/store/playlists";
import type { Ref } from "vue";

const props = defineProps<{
  performance: AlgoliaData;
  isFavorite: boolean | null;
  isPlaying: boolean;
}>();
const emits = defineEmits<{
  click: [];
  "add-favorite": [songUUID: string];
  "remove-favorite": [songUUID: string];
}>();

const youtubeUrl = getYoutubeUrl(props.performance.videoId, props.performance.startSec);
const youtubeThumbnailUrl = getYoutubeThumnailUrl(props.performance.videoId);

const shareYoutubeRef = ref<InstanceType<typeof ShareYoutube> | null>(null);
const tiles = ref([
  {
    icon: "mdi-youtube",
    color: "red",
    title: "YouTubeへ移動",
    click: () => window.open(youtubeUrl),
    requireLogin: false,
  },
  {
    icon: "mdi-share-variant",
    color: "blue-lighten-4",
    title: "共有",
    click: async () => {
      await shareYoutubeRef.value?.popup();
    },
    requireLogin: false,
  },
  {
    icon: "mdi-image-area",
    color: "blue-grey",
    title: "サムネ画像を取得",
    click: () => window.open(youtubeThumbnailUrl),
    requireLogin: false,
  },
]);

const thumbnailImageUrl = supabase.storage
  .from("thumbnails")
  .getPublicUrl(`thumbnails/${props.performance.videoId}.jpg`).data.publicUrl;

const playlistsStore = usePlaylistsStore();
const selectedAddToPlaylist: Ref<string[]> = ref([]);
const showAddToPlaylistDialog = ref(false);

async function onClickAddToPlaylist() {
  for (const playlistId of selectedAddToPlaylist.value.values()) {
    await playlistsStore.addToPlaylist({
      performanceId: props.performance.id,
      playlistId,
    });
  }
  showAddToPlaylistDialog.value = false;
  selectedAddToPlaylist.value = [];
}
</script>

<template>
  <BaseSongCard
    :image-url="thumbnailImageUrl"
    :is-playing="props.isPlaying"
    :performance="props.performance"
    @click="emits('click')"
  >
    <template #post-icon>
      <template v-if="props.isFavorite !== null">
        <v-btn
          :elevation="0"
          icon="mdi-plus-circle-outline"
          @click.stop="showAddToPlaylistDialog = true"
        />
        <template v-if="props.isFavorite">
          <v-btn
            :elevation="0"
            icon="mdi-heart"
            @click.stop="emits('remove-favorite', props.performance.id)"
          />
        </template>
        <template v-else>
          <v-btn
            :elevation="0"
            icon="mdi-heart-outline"
            @click.stop="emits('add-favorite', props.performance.id)"
          />
        </template>
      </template>
    </template>
  </BaseSongCard>

  <ShareYoutube ref="shareYoutubeRef" :performance="props.performance" />

  <v-dialog v-model="showAddToPlaylistDialog" persistent>
    <v-card prepend-icon="mdi-music" title="プレイリストへ追加">
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="{ id: playlistId, name: playlistName } in playlistsStore.playlists?.values()"
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
