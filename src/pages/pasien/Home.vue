<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader />

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
        <h1 class="text-xl font-bold text-slate-800">Selamat {{ greeting }}, {{ userName }}</h1>
        <p class="text-gray-500 text-sm mt-1">
          Semoga bunda dan calon buah hati senantiasa sehat dan bahagia.
        </p>
      </div>

      <div v-if="isLoggedIn && hasActiveQueue" class="bg-white rounded-3xl p-5 shadow-md mt-5">
        <div class="text-xs text-gray-500 text-center">NOMOR ANTREAN ANDA</div>
        <div class="text-3xl font-bold text-[#B81D75] text-center mt-1">
          {{ activeVisit?.queue_number }}
        </div>
        <div class="grid grid-cols-3 gap-2 mt-4 text-center">
          <div>
            <div class="text-xs text-gray-500">Layanan</div>
            <div class="font-semibold text-slate-800">{{ activeVisit?.service?.nama }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Sesi</div>
            <div class="font-semibold text-slate-800">{{ activeVisit?.sesi === 'pagi_siang' ? 'Pagi - Siang' : 'Sore - Malam' }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Status</div>
            <div class="font-semibold text-slate-800">{{ activeVisit?.status }}</div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import TopHeader from '@/components/TopHeader.vue'
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
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 11) return 'Pagi'
  if (h < 15) return 'Siang'
  if (h < 18) return 'Sore'
  return 'Malam'
})
const hasActiveQueue = ref(false)
const activeVisit = ref<any>(null)
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/visits?status=antre`, { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) {
    const data = await res.json()
    console.log('daftar kunjungan', data)
    if (data.items && data.items.length) { hasActiveQueue.value = true; activeVisit.value = data.items[data.items.length - 1] }
  }
})
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
  router.push('/pasien/reg-step1')
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
