<script lang="ts" setup>
import AuthDialog from "@/components/auth/AuthDialog.vue";
import { useTheme } from "vuetify";
const props = defineProps<{
  title: string;
}>();
const drawer = defineModel<boolean>("drawer");

const theme = useTheme();
</script>

<template>
  <v-app-bar
    :style="{
      backgroundColor: theme.global.current.value.colors.primary,
    }"
  >
    <v-app-bar-nav-icon
      :color="theme.global.current.value.colors['on-primary']"
      @click.stop="drawer = !drawer"
    />
    <v-app-bar-title
      class="text-h5 font-weight-bold"
      :style="{
        color: theme.global.current.value.colors['on-primary'],
      }"
    >
      {{ props.title }}
    </v-app-bar-title>
    <auth-dialog
      login-text="Login"
      logout-text="Logout"
      :providers="['twitter', 'google']"
      :text-color="theme.global.current.value.colors['on-primary']"
    />
  </v-app-bar>
</template>

<style lang="scss" scoped></style>
