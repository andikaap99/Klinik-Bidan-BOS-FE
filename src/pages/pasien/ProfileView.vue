<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Profil Saya" />
    <div class="max-w-md mx-auto px-4 mt-4 space-y-4">
      <div class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-gray-500 text-sm">Nama Lengkap</span>
          <div class="flex items-center gap-2">
            <span class="text-slate-800 text-sm">{{ userProfile.nama_lengkap }}</span>
            <ChevronRight class="w-4 h-4 text-gray-400" />
          </div>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-gray-500 text-sm">Username</span>
          <div class="flex items-center gap-2">
            <span class="text-slate-800 text-sm">@{{ userProfile.username }}</span>
            <ChevronRight class="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <div class="text-xs font-semibold text-gray-500 mb-2 px-1">Informasi Kontak</div>
        <div class="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-gray-500 text-sm">No. WhatsApp</span>
            <div class="flex items-center gap-2">
              <span class="text-slate-800 text-sm">{{ userProfile.nomor_wa }}</span>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <button @click="router.push('/pasien/edit-profile')" class="w-full bg-[#B01268] text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-md">
          <Pencil class="w-4 h-4" /> Edit Profil
        </button>
        <button @click="router.push('/pasien/change-password')" class="w-full bg-white border border-[#B01268] text-[#B01268] rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-sm">
          <Lock class="w-4 h-4" /> Ganti Password
        </button>
        <button
          @click="handleLogout"
          class="w-full bg-slate-100 text-slate-700 rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-sm"
          :disabled="isLoggingOut"
        >
          <LogOut class="w-4 h-4" /> Keluar dari Akun
        </button>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, LogOut, ChevronRight, Pencil, Lock } from 'lucide-vue-next'
import BottomNav from '@/components/BottomNav.vue'
import TopHeader from '@/components/TopHeader.vue'

const router = useRouter()
interface UserProfile {
  username: string
  nama_lengkap: string
  nomor_wa: string
}
const userProfile = ref<UserProfile>({ username: '', nama_lengkap: '', nomor_wa: '' })
const isLoading = ref(false)
const isLoggingOut = ref(false)
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'

onMounted(async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token') || ''
    const res = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      userProfile.value = {
        username: data.username,
        nama_lengkap: data.nama_lengkap,
        nomor_wa: data.nomor_wa,
      }
    }
  } finally {
    isLoading.value = false
  }
})

async function handleLogout() {
  isLoggingOut.value = true
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('hasActiveQueue')
  router.push('/pasien/home')
}
</script>
