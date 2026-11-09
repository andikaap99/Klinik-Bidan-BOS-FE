<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Ganti Password" back="/pasien/profile" />
    <div class="max-w-md mx-auto px-4 mt-4">
      <div class="bg-white rounded-2xl shadow-sm p-4">
        <div class="flex items-center gap-2 font-semibold text-slate-800 mb-3"><Lock class="w-5 h-5 text-pink-600" /> Keamanan Kata Sandi</div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Password Saat Ini</label>
            <input v-model="passwordForm.password_lama" :type="showPass ? 'text' : 'password'" class="w-full bg-blue-50/50 rounded-full px-4 py-3 mt-1" />
          </div>
          <div>
            <label class="text-sm font-semibold">Password Baru</label>
            <input v-model="passwordForm.password_baru" :type="showPass ? 'text' : 'password'" class="w-full bg-blue-50/50 rounded-full px-4 py-3 mt-1" />
          </div>
          <button type="button" @click="showPass = !showPass" class="text-sm text-[#B81D75]">Lihat/Sembunyikan Password</button>
          <div v-if="popupVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div class="bg-white rounded-3xl p-6 max-w-sm mx-4 shadow-xl text-center">
              <div class="text-[#B81D75] font-bold text-lg mb-2">{{ popupTitle }}</div>
              <p class="text-gray-600 text-sm">{{ popupMessage }}</p>
              <button @click="handlePopupOk" class="mt-4 bg-[#B81D75] text-white rounded-full px-6 py-2 font-semibold">OK</button>
            </div>
          </div>
          <button @click="submitPassword" class="w-full bg-[#B01268] text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-md" :disabled="isLoadingPassword">
            <KeyRound class="w-4 h-4" /> Perbarui Password
          </button>
        </div>
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, KeyRound } from 'lucide-vue-next'
import TopHeader from '@/components/TopHeader.vue'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
interface ChangePasswordPayload { password_lama: string; password_baru: string }
const passwordForm = reactive<ChangePasswordPayload>({ password_lama: '', password_baru: '' })
const showPass = ref(false)
const isLoadingPassword = ref(false)
const popupVisible = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const logoutAfter = ref(false)
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'

async function submitPassword() {
  isLoadingPassword.value = true
  const token = localStorage.getItem('token') || ''
  try {
    const res = await fetch(`${base}/me/password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(passwordForm) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Gagal mengubah password')
    popupTitle.value = 'Berhasil'
    popupMessage.value = data.message || 'Password berhasil diubah'
    logoutAfter.value = true
    popupVisible.value = true
  } catch (e: any) {
    popupTitle.value = 'Gagal'
    popupMessage.value = e?.message || 'Terjadi kesalahan'
    logoutAfter.value = false
    popupVisible.value = true
  } finally {
    isLoadingPassword.value = false
  }
}
function handlePopupOk() {
  popupVisible.value = false
  if (logoutAfter.value) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('hasActiveQueue')
    router.push('/pasien/home')
  }
}
</script>