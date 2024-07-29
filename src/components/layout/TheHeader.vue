<template>
  <div class="flex justify-between items-center space-x-12 py-2 border-b-1">
    <div class="w-250 m-auto flex justify-between">
      <div class="flex items-center">
        <router-link to="/">
          <div class="flex items-center">
            <div class="font-bold text-[#F56C6C] text-2xl">BAStudio</div>
            <el-tag v-if="mode === 'testnet'" type="info" class="ml-2">testnet</el-tag>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const mode = import.meta.env.VITE_MODE;
</script>

<style lang="scss">
.menu {
  @apply text-xl hover:underline hover:font-bold;
}

.active {
  @apply underline font-bold;
}
</style>
