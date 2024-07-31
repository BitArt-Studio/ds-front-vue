<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="h-full flex flex-col">
    <the-header class="flex-none" />
    <div class="py-5 flex-grow">
      <el-config-provider>
        <router-view :key="route.name"></router-view>
      </el-config-provider>
    </div>
    <the-footer class="flex-none h-10" />
  </div>
</template>
