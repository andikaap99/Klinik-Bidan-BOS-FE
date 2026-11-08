<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t flex z-50">
    <router-link to="/pasien/home" class="flex-1 py-3 flex flex-col items-center gap-1" :class="route.path === '/pasien/home' ? 'text-[#B81D75]' : 'text-gray-400'">
      <Home class="w-5 h-5" />
      <span class="text-xs font-semibold">Beranda</span>
    </router-link>
    <router-link to="/pasien/profile" class="flex-1 py-3 flex flex-col items-center gap-1" :class="route.path === '/pasien/profile' ? 'text-[#B81D75]' : 'text-gray-400'">
      <User class="w-5 h-5" />
      <span class="text-xs font-semibold">Profil</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, User } from 'lucide-vue-next'
const route = useRoute()
</script>