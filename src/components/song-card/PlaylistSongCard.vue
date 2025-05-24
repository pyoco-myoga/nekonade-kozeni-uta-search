<script lang="ts" setup>
import { ref } from "vue";
import BaseSongCard from "./BaseSongCard.vue";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import { supabase } from "@/common";
import { type PlaylistType } from "@/store/playlists";
import type { AlgoliaData } from "@/algolia";

const props = defineProps<{
  performance: AlgoliaData;
  playlistType: PlaylistType;
  isPlaying: boolean;
}>();
const emits = defineEmits<{
  click: [];
}>();

const shareYoutubeRef = ref<InstanceType<typeof ShareYoutube> | null>(null);

const thumbnailImageUrl = supabase.storage
  .from("thumbnails")
  .getPublicUrl(`thumbnails/${props.performance.videoId}.jpg`).data.publicUrl;
</script>

<template>
  <BaseSongCard
    :image-url="thumbnailImageUrl"
    :is-playing="props.isPlaying"
    :performance="performance"
    @click="emits('click')"
  >
    <template v-if="playlistType === 'user'" #post-icon>
      <slot name="user-playlist-post-icon" />
    </template>
  </BaseSongCard>

  <ShareYoutube ref="shareYoutubeRef" :performance="performance" />
</template>
