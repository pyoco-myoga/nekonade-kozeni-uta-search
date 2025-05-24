<script lang="ts" setup>
import { ref } from "vue";
import BaseSongCard from "./BaseSongCard.vue";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import type { AlgoliaData } from "@/algolia";
import { supabase } from "@/common";
import { usePlaylistsStore } from "@/store/playlists";
import type { Ref } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";

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

const shareYoutubeRef = ref<InstanceType<typeof ShareYoutube> | null>(null);

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

const theme = useTheme();
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

  <v-dialog v-model="showAddToPlaylistDialog" height="80%" max-height="80vh" persistent>
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
            <span>プレイリストへ追加</span>
          </span>
        </template>
      </v-toolbar>
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
