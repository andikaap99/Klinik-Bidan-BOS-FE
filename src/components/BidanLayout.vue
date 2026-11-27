<template>
  <div class="min-h-screen flex bg-[#F8FAFC]">
    <BidanSidebar class="hidden md:flex sticky top-0 h-screen" />
    <div class="flex-1 pt-5 px-4 pb-8 md:p-8 max-w-7xl mx-auto overflow-y-auto">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import BidanSidebar from '@/components/BidanSidebar.vue'
</script>