<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Registrasi Pasien (3/3)" back="/pasien/home" />
    <div class="max-w-md mx-auto px-4 mt-4">
      <div class="bg-white rounded-2xl p-5 shadow-md text-center">
        <div class="text-xs text-gray-500">NOMOR ANTREAN ANDA</div>
        <div class="text-3xl font-bold text-[#B81D75] mt-1">{{ result?.queue_number }}</div>
        <div class="mt-4 text-sm text-gray-600">{{ result?.service?.nama }}</div>
        <div class="text-sm text-gray-600">{{ result?.visit_date }} - {{ result?.sesi }}</div>
        <div class="text-sm text-gray-600">Status: {{ result?.status }}</div>
      </div>
      <button @click="router.push('/pasien/home')" class="w-full mt-4 bg-[#B81D75] text-white rounded-full py-3 font-semibold">Selesai</button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopHeader from '@/components/TopHeader.vue'
const router = useRouter()
const result = ref<any>(null)
onMounted(() => { result.value = JSON.parse(localStorage.getItem('regResult') || 'null') })
</script>