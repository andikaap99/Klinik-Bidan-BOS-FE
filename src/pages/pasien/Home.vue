<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header class="flex items-center gap-3 px-4 py-3 bg-white shadow-sm">
      <img src="@/assets/logo.jpeg" alt="logo" class="w-10 h-10 rounded-full object-cover" />
      <div class="font-semibold text-[#B81D75] text-sm">Bdn. Okti Susanti, S.Keb</div>
    </header>

    <div class="max-w-md mx-auto px-4 mt-4">
      <div v-if="!isLoggedIn" class="text-center mt-2">
        <span class="inline-block bg-pink-100 text-[#B81D75] text-xs px-3 py-1 rounded-full"
          >Layanan Ibu & Anak Terpadu</span
        >
        <h1 class="text-xl font-bold text-slate-800 mt-3">
          Selamat Datang di Klinik Bersalin Bdn. Okti Susanti, S.Keb
        </h1>
        <p class="text-gray-500 text-sm mt-2">
          Sahabat Sehat Bunda & Buah Hati. Masuk atau buat akun untuk kemudahan antrean & riwayat
          pemeriksaan.
        </p>
        <div class="flex gap-3 mt-4">
          <router-link
            to="/pasien/login"
            class="flex-1 border border-[#B81D75] text-[#B81D75] rounded-full py-3 text-center font-semibold flex items-center justify-center gap-2"
          >
            <LogIn class="w-4 h-4" /> Masuk
          </router-link>
          <router-link
            to="/pasien/register"
            class="flex-1 bg-[#B81D75] text-white rounded-full py-3 text-center font-semibold flex items-center justify-center gap-2"
          >
            <UserPlus class="w-4 h-4" /> Daftar
          </router-link>
        </div>
      </div>
      <div v-else>
        <h1 class="text-xl font-bold text-slate-800">Selamat Pagi, {{ userName }}</h1>
        <p class="text-gray-500 text-sm mt-1">
          Semoga bunda dan calon buah hati senantiasa sehat dan bahagia.
        </p>
      </div>

      <div v-if="isLoggedIn && hasActiveQueue" class="bg-white rounded-3xl p-5 shadow-md mt-5">
        <div class="text-xs text-gray-500 text-center">NOMOR ANTREAN ANDA</div>
        <div class="text-3xl font-bold text-[#B81D75] text-center mt-1">
          {{ activeQueue.queueNumber }}
        </div>
        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Dipanggil</div>
            <div class="font-semibold text-slate-800">{{ activeQueue.currentCalled }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Sisa Antrean</div>
            <div class="font-semibold text-slate-800">{{ activeQueue.remainingCount }} Pasien</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Estimasi</div>
            <div class="font-semibold text-slate-800">{{ activeQueue.estimatedTime }}</div>
          </div>
        </div>
      </div>

      <div class="mt-6">
        <div class="flex items-center justify-between">
          <h2 class="font-bold text-slate-800">Layanan</h2>
          <span class="text-xs bg-pink-100 text-[#B81D75] px-2 py-1 rounded-full">8 Layanan</span>
        </div>
        <p class="text-gray-500 text-sm mt-1">
          Silakan pilih layanan kesehatan yang Anda butuhkan untuk melanjutkan proses pendaftaran.
        </p>
        <div class="grid grid-cols-4 gap-3 mt-4">
          <button
            v-for="s in services"
            :key="s.name"
            class="flex flex-col items-center gap-1 p-3 rounded-2xl shadow-sm"
            :class="s.bg"
            @click="onServiceClick(s.name)"
          >
            <component :is="s.icon" class="w-6 h-6" :class="s.color" />
            <span class="text-xs font-medium text-slate-700 text-center">{{ s.name }}</span>
          </button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import {
  Heart,
  Baby,
  Stethoscope,
  Activity,
  Pill,
  Syringe,
  Scan,
  HeartPulse,
  LogIn,
  UserPlus,
} from 'lucide-vue-next'

const router = useRouter()
const isLoggedIn = ref(!!localStorage.getItem('user'))
const userName = ref(JSON.parse(localStorage.getItem('user') || '{}').nama_lengkap || 'Bunda Sarah')
const hasActiveQueue = ref(localStorage.getItem('hasActiveQueue') === 'true')
const activeQueue = ref({
  queueNumber: 'B-014',
  currentCalled: 'B-012',
  remainingCount: 2,
  estimatedTime: '± 15 Mnt',
})

function login() {
  localStorage.setItem('user', JSON.stringify({ nama_lengkap: userName.value }))
  isLoggedIn.value = true
}
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('hasActiveQueue')
  isLoggedIn.value = false
  hasActiveQueue.value = false
  userName.value = 'Bunda Sarah'
}
function takeQueue() {
  hasActiveQueue.value = true
}
function onServiceClick(s: string) {
  if (!isLoggedIn.value) {
    router.push('/pasien/login')
    return
  }
  router.push({ path: '/pasien/register-visit', query: { service: s } })
}

const services = [
  { name: 'Ibu Hamil', icon: Heart, bg: 'bg-pink-50', color: 'text-pink-500' },
  { name: 'Ibu Bersalin', icon: Baby, bg: 'bg-pink-50', color: 'text-pink-500' },
  { name: 'Imunisasi', icon: Syringe, bg: 'bg-sky-50', color: 'text-sky-500' },
  { name: 'KB', icon: Pill, bg: 'bg-sky-50', color: 'text-sky-500' },
  { name: 'Berobat', icon: Stethoscope, bg: 'bg-sky-50', color: 'text-sky-500' },
  { name: 'Pijat Bayi', icon: HeartPulse, bg: 'bg-pink-50', color: 'text-pink-500' },
  { name: 'USG', icon: Scan, bg: 'bg-sky-50', color: 'text-sky-500' },
  { name: 'Promil', icon: Activity, bg: 'bg-pink-50', color: 'text-pink-500' },
]
</script>
