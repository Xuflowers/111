<template>
  <div class="favorites-page">
    <van-nav-bar title="设置" left-arrow @click="goBack" />
  </div>
</template>

<script setup>
  import { useRouter } from "vue-router";
  import { useStore } from "vuex";
  import { computed } from "vue";
  import {Toast} from "vant";

  const router = useRouter();
  const store = useStore();
</script>

<style scoped>

</style>