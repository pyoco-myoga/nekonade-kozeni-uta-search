<script lang="ts" setup>
import type { AccompanimentType, AlgoliaData } from "@/algolia";
import { match } from "ts-pattern";
import { type Ref, ref } from "vue";
import { computed } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import ScrollableText from "@/components/utils/ScrollableText.vue";
import type { BottomMenuTile } from "@/components/bottom-menu/BottomMenu.vue";
import { getYoutubeUrl } from "@/utils";

const props = withDefaults(
  defineProps<{
    performance: AlgoliaData;
    isPlaying: boolean;
    imageUrl: string;
    extraBottomMenu?: Array<BottomMenuTile>;
  }>(),
  {
    extraBottomMenu: () => [],
  }
);
const emits = defineEmits<{ click: [] }>();

const showBottomMenu = defineModel<boolean>();
const shareYoutubeRef: Ref<InstanceType<typeof ShareYoutube> | null> = ref(null);

const theme = useTheme();

const bottomMenuTiles: Array<BottomMenuTile> = [
  {
    icon: "mdi-share-variant",
    color: "blue",
    title: "共有",
    click: () => {
      shareYoutubeRef.value?.popup();
    },
    requiredLogin: false,
  },
  {
    icon: "mdi-youtube",
    color: "red",
    title: "Youtubeへ移動",
    click: () => {
      window.open(getYoutubeUrl(props.performance.videoId, props.performance.startSec));
    },
    requiredLogin: false,
  },
  ...props.extraBottomMenu,
];

const color = computed(() => {
  const playingColor = "grey-lighten-2";
  const notPlayingColor = "white";
  return props.isPlaying ? playingColor : notPlayingColor;
});

function accompanimentIcon(accompaniment: AccompanimentType): string {
  return match(accompaniment)
    .with("KARAOKE", () => "mdi-music")
    .with("ELECTRIC", () => "mdi-guitar-electric")
    .with("ACOUSTIC", () => "mdi-guitar-acoustic")
    .exhaustive();
}
</script>

<template>
  <v-card class="mx-auto" @click="emits('click')">
    <v-sheet class="d-flex" :color="color" height="80px">
      <div class="d-flex me-1">
        <v-btn
          elevation="0"
          height="100%"
          :style="{
            backgroundImage: `url(${props.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }"
          @click.stop="() => {}"
        >
          <v-icon
            icon="mdi-play"
            size="x-large"
            :color="theme.current.value.colors['on-background']"
          />
        </v-btn>
      </div>
      <div class="d-flex me-3 align-center">
        <v-icon
          :color="theme.current.value.colors['on-background']"
          :icon="accompanimentIcon(props.performance.accompaniment)"
        />
      </div>
      <div class="d-flex flex-column flex-grow-1 overflow-hidden justify-center">
        <v-list-item-title class="overflow-hidden custom-title-style">
          <ScrollableText :text="props.performance.song" :speed="20" :stop-milliseconds="3000" />
        </v-list-item-title>
        <v-list-item-subtitle
          class="overflow-hidden"
          style="white-space: nowrap; line-height: normal"
        >
          {{ props.performance.artist }}
        </v-list-item-subtitle>
      </div>
      <div class="d-flex align-center">
        <slot name="post-icon" />
        <v-btn
          :elevation="0"
          icon="mdi-dots-vertical"
          @click.stop="showBottomMenu = !showBottomMenu"
        />
      </div>
    </v-sheet>
  </v-card>
  <ShareYoutube ref="shareYoutubeRef" :performance="props.performance" />
  <BottomMenu v-model:show="showBottomMenu" :tiles="bottomMenuTiles" />
</template>

<style scoped>
.custom-title-style {
  text-overflow: ellipsis;
}
</style>
