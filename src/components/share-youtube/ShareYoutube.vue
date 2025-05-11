<script lang="ts" setup>
  import { ref } from 'vue';
  import { getYoutubeUrl } from '@/utils';
  import type { AlgoliaData } from '@/algolia';

  const show = ref(false);

  const { performance, timeout = 1000 } = defineProps<{
    performance: AlgoliaData;
    timeout?: number;
  }>();

  async function popup () {
    const youtubeUrl = getYoutubeUrl(performance.videoId, performance.startSec);
    await navigator.clipboard.writeText(`${performance.song} / ${performance.artist}: ${youtubeUrl}`);
    show.value = true;
  }
  defineExpose({
    popup,
  });
</script>

<template>
  <v-snackbar v-model="show" :timeout="timeout">
    <div>クリップボードにコピーしました</div>
    <div>{{ performance.song }} / {{ performance.artist }}</div>
  </v-snackbar>
</template>
