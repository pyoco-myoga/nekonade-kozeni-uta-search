<script lang="ts" setup>
import { useUserStore } from "@/store/user";
const store = useUserStore();

export type BottomMenuTile = {
  icon: string;
  color: string;
  title: string;
  click: () => void;
  requiredLogin: boolean;
};

const props = defineProps<{
  tiles: Array<BottomMenuTile>;
}>();
const show = defineModel<boolean>("show");
</script>

<template>
  <v-bottom-sheet v-model="show">
    <v-list>
      <v-list-item
        v-for="tile in props.tiles.filter((tile) => store.isLoggedIn() || !tile.requiredLogin)"
        :key="tile.title"
        density="compact"
        :title="tile.title"
        @click="
          () => {
            show = false;
            tile.click();
          }
        "
      >
        <template #prepend>
          <v-icon :color="tile.color" :icon="tile.icon" />
        </template>
      </v-list-item>
    </v-list>
  </v-bottom-sheet>
</template>
