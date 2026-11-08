<template>
  <div class="min-h-screen bg-white">
    <header class="flex items-center gap-2 px-4 py-3">
      <router-link to="/pasien/home" class="text-xl">&lt;</router-link>
      <span class="font-semibold text-[#B81D75]">Bdn. Okti Susanti, S.Keb</span>
    </header>

    <div class="max-w-md mx-auto px-4">
      <img src="@/assets/logo.jpeg" alt="logo" class="w-20 h-20 mx-auto rounded-full object-cover" />
      <h1 class="text-2xl font-bold text-center text-slate-800 mt-4">Daftar Akun Baru</h1>
      <p class="text-center text-gray-500 mt-1 text-sm">Lengkapi data di bawah ini untuk membuat akun.</p>

      <div class="bg-white rounded-3xl p-6 shadow-sm mt-6">
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Username <span class="text-red-500">*</span></label>
            <input v-model="form.username" type="text" placeholder="Pilih username" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 outline-none" />
            <p v-if="form.username && !/^[a-z]+$/.test(form.username)" class="text-xs text-red-500 mt-1">Username hanya huruf kecil tanpa spasi.</p>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Nama Lengkap <span class="text-red-500">*</span></label>
            <input v-model="form.nama" type="text" placeholder="Nama lengkap" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 outline-none" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Nomor WhatsApp <span class="text-red-500">*</span></label>
            <input v-model="form.whatsapp" type="tel" placeholder="0812-xxxx-xxxx" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 outline-none" @keydown="onWhatsappKeydown" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Password <span class="text-red-500">*</span></label>
            <div class="flex items-center bg-blue-50/50 rounded-xl px-3">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Buat kata sandi" class="w-full bg-transparent py-3 outline-none" />
              <button type="button" @click="showPass = !showPass" class="text-gray-500 text-sm">{{ showPass ? 'Sembunyi' : 'Lihat' }}</button>
            </div>
          </div>
          <button type="submit" class="w-full bg-[#B81D75] text-white rounded-full py-3 font-semibold" :disabled="loading">
            {{ loading ? 'Memproses...' : 'Daftar Akun' }}
          </button>
        </form>
      </div>
      <div v-if="popupVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-6 max-w-sm mx-4 shadow-xl text-center">
          <div class="text-[#B81D75] font-bold text-lg mb-2">{{ popupTitle }}</div>
          <p class="text-gray-600 text-sm">{{ popupMessage }}</p>
          <button @click="popupVisible = false; router.push('/pasien/login')" class="mt-4 bg-[#B81D75] text-white rounded-full px-6 py-2 font-semibold">OK</button>
        </div>
      </div>

      <p class="text-center text-sm mt-4">
        Sudah punya akun?
        <router-link to="/pasien/login" class="text-[#B81D75] font-bold">Masuk di Sini</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import type { RegisterPayload } from '@/types/auth'

const router = useRouter()
const showPass = ref(false)
const loading = ref(false)
const form = reactive({ username: '', nama: '', whatsapp: '', password: '' })
const popupVisible = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
function showPopup(title: string, message: string) { popupTitle.value = title; popupMessage.value = message; popupVisible.value = true }
function onWhatsappKeydown(e: KeyboardEvent) { if (!/[0-9]/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) e.preventDefault() }

async function handleSubmit() {
  if (!/^[a-z]+$/.test(form.username)) { showPopup('Gagal', 'Username hanya boleh huruf kecil tanpa spasi.'); return }
  if (!/^\d+$/.test(form.whatsapp)) { showPopup('Gagal', 'Nomor WhatsApp hanya boleh angka.'); return }
  loading.value = true
  try {
    const payload: RegisterPayload = { ...form }
    await authService.register(payload)
    showPopup('Berhasil', 'Silahkan login dengan akun yang sudah anda buat')
    form.username = ''
    form.nama = ''
    form.whatsapp = ''
    form.password = ''
  } catch (e) {
    showPopup('Gagal', 'Registrasi gagal. Username mungkin sudah digunakan atau data tidak valid.')
  } finally {
    loading.value = false
  }
}
</script>
