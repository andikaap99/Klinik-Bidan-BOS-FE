<template>
  <div v-if="visible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white rounded-3xl p-6 max-w-sm mx-4 shadow-xl text-center">
      <div class="text-[#B81D75] font-bold text-lg mb-2">{{ title }}</div>
      <p class="text-gray-600 text-sm">{{ message }}</p>
      <button @click="visible = false" class="mt-4 bg-[#B81D75] text-white rounded-full px-6 py-2 font-semibold">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const props = defineProps<{ title?: string; message: string }>()
const visible = ref(true)
</script>