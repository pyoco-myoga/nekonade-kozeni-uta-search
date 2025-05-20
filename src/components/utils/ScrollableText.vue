<script setup lang="ts">
import { computed } from "vue";
import { ref, onMounted } from "vue";

const props = defineProps<{
  text: string;
  speed: number;
  stopMilliseconds: number;
}>();

const wrapperRef = ref<HTMLElement | null>(null);
const textRef = ref<HTMLElement | null>(null);

const distance = ref(0);
const position = ref(0);
const shouldScroll = ref(false);
const enableTransition = ref(false);

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function startScrollLoop() {
  if (!shouldScroll.value) {
    return;
  }

  await wait(props.stopMilliseconds);
  position.value = -distance.value;
  enableTransition.value = true;
}

async function onTransitionEnd() {
  await wait(props.stopMilliseconds);
  position.value = 0;
  enableTransition.value = false;

  await startScrollLoop();
}

onMounted(async () => {
  const wrapper = wrapperRef.value;
  const text = textRef.value;
  if (wrapper && text) {
    const wrapperWidth = wrapper.clientWidth;
    const textWidth = text.scrollWidth;

    if (textWidth > wrapperWidth) {
      shouldScroll.value = true;
      distance.value = textWidth - wrapperWidth;
      await startScrollLoop();
    }
  }
});

const computedStyle = computed(() => {
  const base: Record<string, string> = {};

  if (enableTransition.value) {
    const duration = Math.abs(position.value) / props.speed;
    base.transition = `transform ${duration}s linear`;
    base.transform = `translateX(${position.value}px)`;
  } else if (position.value !== 0) {
    base.transform = `translateX(${position.value}px)`;
  }
  return base;
});
</script>

<style lang="scss" scoped>
.marquee-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
}

.marquee-text {
  display: inline-block;
  white-space: nowrap;

  backface-visibility: hidden;
  will-change: transform;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
</style>

<template>
  <div ref="wrapperRef" class="marquee-wrapper">
    <div ref="textRef" class="marquee-text" :style="computedStyle" @transitionend="onTransitionEnd">
      {{ props.text }}
    </div>
  </div>
</template>
