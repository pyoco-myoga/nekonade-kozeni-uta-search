<script lang="ts" setup>
import { onUnmounted, ref, type Ref } from "vue";
import YouTube from "vue3-youtube";
import PlayerStates from "youtube-player/dist/constants/PlayerStates";
import { computed } from "vue";
import type { AlgoliaData } from "@/algolia";
import { getYoutubeUrl } from "@/utils";
import ShareYoutube from "@/components/share-youtube/ShareYoutube.vue";
import { watch } from "vue";
import { useTheme } from "vuetify/lib/composables/theme.mjs";
import { throttle } from "vuetify/lib/util/helpers.mjs";

const props = defineProps<{
  currentPerformance: AlgoliaData;
}>();
const emits = defineEmits<{
  previous: [];
  next: [];
  ended: [];
  close: [];
}>();

const playing = ref(false);
const seconds = ref<number | null>(null);
const progress = ref<number | null>(null);

function displayTime(seconds: number | null): string {
  if (seconds === null) {
    return "--:--";
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  if (hours === 0) {
    return `${formattedMinutes}:${formattedSeconds}`;
  } else {
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}

const secondsFromStart = computed(() => {
  return displayTime(seconds.value);
});
const secondsToEnd = computed(() => {
  if (seconds.value === null) {
    return displayTime(null);
  }
  return displayTime(
    props.currentPerformance.endSec - props.currentPerformance.startSec - seconds.value
  );
});

const shareYoutubeRef: Ref<InstanceType<typeof ShareYoutube> | null> = ref(null);

const youtube: Ref<InstanceType<typeof YouTube> | null> = ref(null);

function onStateChange(e: any) {
  if (e.data === PlayerStates.PLAYING) {
    playing.value = true;
  }
  if (e.data === PlayerStates.PAUSED) {
    playing.value = false;
  }
  if (e.data === PlayerStates.ENDED) {
    emits("ended");
    playing.value = false;
  }
}

function onClose() {
  emits("close");
  youtube.value?.player?.destroy();
}

function onPlay() {
  youtube.value?.player?.playVideo();
}
function onPause() {
  youtube.value?.player?.pauseVideo();
}

const youtubeURL = getYoutubeUrl(
  props.currentPerformance.videoId,
  props.currentPerformance.startSec
);

function gotoYoutube() {
  window.open(youtubeURL);
}

let rewindClickTimeout: NodeJS.Timeout | null = null;
function onRewindClickedEvent() {
  if (rewindClickTimeout !== null) {
    clearTimeout(rewindClickTimeout);
    rewindClickTimeout = null;
    emits("previous");
  } else {
    rewindClickTimeout = setTimeout(() => {
      youtube.value?.seekTo(props.currentPerformance.startSec, true);
      rewindClickTimeout = null;
    }, 200);
  }
}

let intervalId: NodeJS.Timeout | null = null;
function onReady() {
  const UPDATE_PROGRESS_INTERVAL = 300;
  youtube.value?.player?.playVideo();
  intervalId = setInterval(async () => {
    const currentTime = youtube.value?.player?.getCurrentTime() ?? null;
    if (currentTime !== null) {
      seconds.value = currentTime - props.currentPerformance.startSec;
    } else {
      seconds.value = null;
    }
  }, UPDATE_PROGRESS_INTERVAL);
}
onUnmounted(() => {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
});

watch(seconds, (newSeconds) => {
  if (newSeconds !== null) {
    progress.value =
      (100 * newSeconds) / (props.currentPerformance.endSec - props.currentPerformance.startSec);
  }
});

const onSliderChange = throttle((value: number) => {
  const duration = props.currentPerformance.endSec - props.currentPerformance.startSec;
  const newSeconds = (value / 100) * duration + props.currentPerformance.startSec;
  youtube.value?.player?.seekTo(newSeconds, true);
}, 100);

const theme = useTheme();
</script>

<template>
  <v-footer app class="elevation-10 justify-center" :color="theme.current.value.colors.background">
    <v-container class="ma-0 pa-0">
      <v-row class="ma-0 pa-0 justify-center">
        <!-- player -->
        <v-col class="text-center" lg="5" md="5" sm="5" xl="5" xs="12">
          <YouTube
            :key="props.currentPerformance.id"
            ref="youtube"
            height="20%"
            :src="props.currentPerformance.videoId"
            :vars="{
              start: props.currentPerformance.startSec,
              end: props.currentPerformance.endSec,
              controls: 0,
              modestbranding: 1,
            }"
            width="auto"
            @ready="onReady"
            @state-change="onStateChange"
          />
        </v-col>
        <!-- controller -->
        <v-col class="justify-center" lg="7" md="7" sm="7" xl="7" xs="12">
          <v-row class="text-center justify-center">
            <v-col class="ma-auto" cols="1">
              <v-btn
                icon="mdi-share-variant"
                variant="text"
                :color="theme.current.value.colors['on-background']"
                @click="shareYoutubeRef?.popup()"
              />
            </v-col>
            <v-col cols="10">
              <v-list-item-title>
                {{ props.currentPerformance.song }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ props.currentPerformance.artist }}
              </v-list-item-subtitle>
            </v-col>
            <v-col class="ma-auto" cols="1">
              <v-btn
                icon="mdi-youtube"
                variant="text"
                :color="theme.current.value.colors['on-background']"
                @click="gotoYoutube"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              class="pa-0 text-caption"
              :style="{
                color: theme.current.value.colors['on-background'],
              }"
              cols="auto"
            >
              {{ secondsFromStart }}
            </v-col>
            <v-col class="pa-0 align-center">
              <v-slider
                :color="theme.current.value.colors.primary"
                :track-color="theme.current.value.colors.secondary"
                :thumb-color="theme.current.value.colors.primary"
                :model-value="progress ?? undefined"
                thumb-size="10"
                track-size="3"
                @update:model-value="onSliderChange"
                hide-details
              />
            </v-col>
            <v-col
              class="pa-0 text-caption"
              :style="{
                color: theme.current.value.colors['on-background'],
              }"
              cols="auto"
            >
              {{ secondsToEnd }}
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="auto">
              <v-btn :icon="true" variant="text" />
            </v-col>
            <v-col class="text-center">
              <v-btn
                icon="mdi-rewind"
                variant="text"
                :color="theme.current.value.colors['on-background']"
                @click="onRewindClickedEvent"
              />
              <template v-if="playing">
                <v-btn
                  icon="mdi-pause"
                  variant="text"
                  :color="theme.current.value.colors['on-background']"
                  @click="onPause"
                />
              </template>
              <template v-else>
                <v-btn
                  icon="mdi-play"
                  variant="text"
                  :color="theme.current.value.colors['on-background']"
                  @click="onPlay"
                />
              </template>
              <v-btn
                icon="mdi-fast-forward"
                variant="text"
                :color="theme.current.value.colors['on-background']"
                @click="emits('next')"
              />
            </v-col>
            <v-col cols="auto">
              <v-btn
                icon="mdi-close"
                variant="text"
                :color="theme.current.value.colors['on-background']"
                @click="onClose"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
  <ShareYoutube ref="shareYoutubeRef" :performance="props.currentPerformance" />
</template>
