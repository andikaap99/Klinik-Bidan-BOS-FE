<template>
  <div class="min-h-screen bg-white">
    <TopHeader back="/pasien/home" />
    <div class="max-w-md mx-auto px-4 mt-6">
      <img src="@/assets/logo.jpeg" alt="logo" class="w-20 h-20 mx-auto rounded-full object-cover" />
      <h1 class="text-2xl font-bold text-center text-slate-800 mt-4">Masuk</h1>
      <p class="text-center text-gray-500 mt-1 text-sm">Selamat datang kembali.</p>
      <div class="bg-white rounded-3xl p-6 shadow-sm mt-6">
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Username <span class="text-red-500">*</span></label>
            <input v-model="form.username" type="text" placeholder="Masukkan username" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 outline-none" />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-semibold mb-1">Password <span class="text-red-500">*</span></label>
            <div class="flex items-center bg-blue-50/50 rounded-xl px-3">
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Masukkan password" class="w-full bg-transparent py-3 outline-none" />
              <button type="button" @click="showPass = !showPass" class="text-gray-500 text-sm">{{ showPass ? 'Sembunyi' : 'Lihat' }}</button>
            </div>
          </div>
          <button type="submit" class="w-full bg-[#B81D75] text-white rounded-full py-3 font-semibold" :disabled="loading">
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>
        </form>
      </div>
      <div v-if="popupVisible" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div class="bg-white rounded-3xl p-6 max-w-sm mx-4 shadow-xl text-center">
          <div class="text-[#B81D75] font-bold text-lg mb-2">{{ popupTitle }}</div>
          <p class="text-gray-600 text-sm">{{ popupMessage }}</p>
          <button @click="handlePopupOk" class="mt-4 bg-[#B81D75] text-white rounded-full px-6 py-2 font-semibold">OK</button>
        </div>
      </div>
      <p class="text-center text-sm mt-4">
        Belum punya akun?
        <router-link to="/pasien/register" class="text-[#B81D75] font-bold">Daftar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import TopHeader from '@/components/TopHeader.vue'
import { authService } from '@/services/authService'
import type { LoginPayload } from '@/types/auth'

const router = useRouter()
const showPass = ref(false)
const loading = ref(false)
const form = reactive({ username: '', password: '' })
const popupVisible = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
const redirectOnOk = ref(false)
function showPopup(title: string, message: string) { popupTitle.value = title; popupMessage.value = message; popupVisible.value = true }
function handlePopupOk() { popupVisible.value = false; if (redirectOnOk.value) router.push('/pasien/home') }

async function handleSubmit() {
  loading.value = true
  try {
    const payload: LoginPayload = { ...form }
    const res = await authService.login(payload)
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('user', JSON.stringify(res.user))
    redirectOnOk.value = true
    showPopup('Berhasil', 'Berhasil masuk')
    form.username = ''
    form.password = ''
  } catch (e) {
    redirectOnOk.value = false
    showPopup('Gagal', 'Username atau password salah. Silakan coba lagi.')
  } finally {
    loading.value = false
  }
}
</script>
