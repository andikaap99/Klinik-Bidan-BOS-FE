<template>
  <header class="flex items-center gap-3 px-4 py-3 bg-white shadow-sm">
    <router-link v-if="back" :to="back" class="text-xl cursor-pointer">&lt;</router-link>
    <img src="@/assets/logo.jpeg" alt="logo" class="w-10 h-10 rounded-full object-cover" />
    <div class="font-semibold text-[#B81D75] text-sm">{{ title || 'Bdn. Okti Susanti, S.Keb' }}</div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ title?: string; back?: string }>()
</script>