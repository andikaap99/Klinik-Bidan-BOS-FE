<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Pengaturan Akun & Keamanan" />
    <div class="max-w-md mx-auto px-4 mt-4 space-y-4">
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center gap-2 font-semibold text-slate-800 mb-3"><UserCheck class="w-5 h-5 text-pink-600" /> Informasi Profil</div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Username</label>
            <input v-model="profileForm.username" class="w-full bg-blue-50/50 rounded-full px-4 py-3 mt-1" />
          </div>
          <div>
            <label class="text-sm font-semibold">Nama Lengkap</label>
            <input v-model="profileForm.nama_lengkap" class="w-full bg-blue-50/50 rounded-full px-4 py-3 mt-1" />
          </div>
          <div>
            <label class="text-sm font-semibold">No. WhatsApp</label>
            <input v-model="profileForm.nomor_wa" class="w-full bg-blue-50/50 rounded-full px-4 py-3 mt-1" />
          </div>
          <Popup v-if="popupVisible" :title="popupTitle" :message="popupMessage" @close="handlePopupClose" />
          <button @click="submitProfile" class="w-full bg-[#B01268] text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-md" :disabled="isLoadingProfile">
            <Save class="w-4 h-4" /> Simpan Perubahan Profil
          </button>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserCheck, Save } from 'lucide-vue-next'
import TopHeader from '@/components/TopHeader.vue'
import BottomNav from '@/components/BottomNav.vue'
import Popup from '@/components/Popup.vue'

const router = useRouter()
interface UpdateProfilePayload { username?: string; nama_lengkap?: string; nomor_wa?: string }

const profileForm = reactive<UpdateProfilePayload>({ username: '', nama_lengkap: '', nomor_wa: '' })
const isLoadingProfile = ref(false)
const popupVisible = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const redirectOnClose = ref(false)
const message = ref('')
const isError = ref(false)
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'

onMounted(async () => {
  const token = localStorage.getItem('token') || ''
  const res = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) {
    const data = await res.json()
    profileForm.username = data.username
    profileForm.nama_lengkap = data.nama_lengkap
    profileForm.nomor_wa = data.nomor_wa
  }
})

async function submitProfile() {
  isLoadingProfile.value = true
  message.value = ''
  const token = localStorage.getItem('token') || ''
  try {
    const res = await fetch(`${base}/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(profileForm) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan')
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    u.nama_lengkap = profileForm.nama_lengkap
    localStorage.setItem('user', JSON.stringify(u))
    popupTitle.value = 'Berhasil'
    popupMessage.value = 'Profil berhasil diperbarui'
    redirectOnClose.value = true
    popupVisible.value = true
    isError.value = false
  } catch (e: any) {
    popupTitle.value = 'Gagal'
    popupMessage.value = e?.message || 'Terjadi kesalahan'
    redirectOnClose.value = false
    popupVisible.value = true
  } finally {
    isLoadingProfile.value = false
  }
}
function handlePopupClose() {
  popupVisible.value = false
  if (redirectOnClose.value) router.push('/pasien/profile')
}
</script>