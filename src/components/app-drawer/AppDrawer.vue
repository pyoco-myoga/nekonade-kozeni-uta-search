<script lang="ts" setup>
import { useRouter } from "vue-router";
import { useTheme } from "vuetify";

const drawer = defineModel<boolean>("drawer");

const theme = useTheme();

const router = useRouter();

const version = `v${__APP_VERSION__}`;
</script>

<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    fixed
    :style="{
      color: theme.global.current.value.colors['on-background'],
    }"
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-magnify"
        title="Search"
        @click="router.push({ name: 'Search' })"
      />
      <v-list-item
        prepend-icon="mdi-music"
        title="Playlist"
        @click="router.push({ name: 'Playlist' })"
      />
    </v-list>
    <template #append>
      <v-divider />
      <v-list>
        <v-list-item
          prepend-icon="mdi-file-document"
          title="Terms Of Service"
          @click="router.push({ name: 'TermsOfService' })"
        />
        <v-list-item
          prepend-icon="mdi-shield"
          title="Privacy Policy"
          @click="router.push({ name: 'PrivacyPolicy' })"
        />
      </v-list>
      <v-divider />
      <div class="text-center">version: {{ version }}</div>
    </template>
  </v-navigation-drawer>
</template>
