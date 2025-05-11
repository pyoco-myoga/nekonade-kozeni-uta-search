<script lang="ts" setup>
  import { marked } from 'marked';
  import rawMarkdown from '@/public/privacy-policy.md?raw';
  const htmlContent = marked(rawMarkdown);
</script>
<template>
  <v-container class="prose" v-html="htmlContent" />
</template>
