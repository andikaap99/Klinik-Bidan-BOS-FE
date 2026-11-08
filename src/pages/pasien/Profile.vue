<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header class="px-4 py-3 bg-white shadow-sm">
      <div class="font-semibold text-[#B81D75]">Profil</div>
    </header>
    <div class="max-w-md mx-auto px-4 mt-6">
      <div class="bg-white rounded-3xl p-6 shadow-md">
        <div class="text-lg font-bold text-slate-800">{{ user?.nama_lengkap || user?.nama }}</div>
        <div class="text-sm text-gray-500 mt-1">{{ user?.username }}</div>
        <div class="text-sm text-gray-500">{{ user?.nomor_wa || user?.whatsapp }}</div>
        <div class="text-sm text-gray-500">Role: {{ user?.role }}</div>
        <button @click="logout" class="mt-4 w-full bg-[#B81D75] text-white rounded-full py-3 font-semibold">Logout</button>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
const router = useRouter()
const user = ref<any>(null)
onMounted(() => {
  const raw = localStorage.getItem('user')
  user.value = raw ? JSON.parse(raw) : null
})
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/pasien/login')
}
</script>