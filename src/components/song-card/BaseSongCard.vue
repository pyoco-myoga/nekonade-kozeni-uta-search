<script lang="ts" setup>
  import type { AlgoliaData } from '@/algolia';
  import { computed } from 'vue';

  const props = defineProps<{
    performance: AlgoliaData;
    isPlaying: boolean;
    imageUrl: string;
  }>();
  const emits = defineEmits<{ click: [] }>();

  const showBottomMenu = defineModel<boolean>();

  const color = computed(() => {
    const playingColor = 'grey-lighten-2';
    const notPlayingColor = 'white';
    return props.isPlaying ? playingColor : notPlayingColor;
  });
</script>

<template>
  <v-card class="mx-auto" elevation="2" @click="emits('click')">
    <v-sheet class="d-flex" :color="color" height="80">
      <div class="d-flex me-3">
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
          <v-icon icon="mdi-play" size="x-large" />
        </v-btn>
      </div>
      <div class="d-flex flex-column flex-grow-1 overflow-hidden justify-center">
        <v-list-item-title class="overflow-hidden custom-title-style">
          {{ props.performance.song }}
        </v-list-item-title>
        <v-list-item-subtitle class="overflow-hidden" style="white-space: nowrap">
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
</template>

<style scoped>
.custom-title-style {
  text-overflow: ellipsis;
}
</style>
