<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50/80 via-white to-pink-50/80">
        <img src="@/assets/logo.jpeg" alt="logo" class="w-40 h-40 object-contain" />
        <p class="mt-4 text-sm font-semibold text-slate-700 text-center">Tempat Praktek Mandiri Bidan Bdn. Okti Susanti, S.Keb (BOS)</p>
      </div>
      <div class="bg-white p-8 md:p-10 flex flex-col justify-center">
        <h1 class="text-2xl font-bold text-slate-900">Masuk ke Akun</h1>
        <p class="text-xs text-slate-500 mt-1 mb-6">Silakan masukkan username dan kata sandi Anda untuk mengakses website Bdn. Okti Susanti, S.Keb.</p>

        <div v-if="error" class="bg-rose-50 text-rose-600 border border-rose-200 rounded-xl p-3 text-xs mb-4">{{ error }}</div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Username</label>
            <div class="flex items-center border border-slate-200 rounded-xl px-3 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
              <User class="w-4 h-4 text-slate-400 mr-2" />
              <input v-model="form.username" type="text" placeholder="Masukkan username Anda" class="w-full py-3 text-sm outline-none" />
            </div>
          </div>
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs font-semibold text-slate-700">Password</label>
              <a href="#" class="text-xs font-medium text-blue-600 hover:underline">Lupa kata sandi?</a>
            </div>
            <div class="flex items-center border border-slate-200 rounded-xl px-3 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900">
              <Lock class="w-4 h-4 text-slate-400 mr-2" />
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Masukkan password Anda" class="w-full py-3 text-sm outline-none" />
              <button type="button" @click="showPass = !showPass" class="text-slate-400">
                <Eye v-if="!showPass" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors mt-6" :disabled="loading">
            {{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}
          </button>
        </form>

        <div class="text-center text-xs text-slate-500 mt-6">
          Belum memiliki akun Praktik Mandiri Bidan?
          <a href="#" class="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">Daftar Praktik Mandiri Baru <ExternalLink class="w-3 h-3" /></a>
        </div>
        <p class="text-center text-xs text-slate-500 mt-2">
          Bukan bidan? <router-link to="/pasien/login" class="text-blue-600 font-semibold hover:underline">Masuk sebagai Pasien</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BidanLoginView' })
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, Eye, EyeOff, ExternalLink } from 'lucide-vue-next'
import { authService } from '@/services/authService'
import type { LoginPayload } from '@/types/auth'

const router = useRouter()
const showPass = ref(false)
const loading = ref(false)
const error = ref('')
const form = reactive({ username: '', password: '' })

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    const payload: LoginPayload = { ...form }
    const res = await authService.login(payload)
    if (res.user?.role !== 'bidan') {
      error.value = 'Akun ini terdaftar sebagai Pasien. Silakan masuk melalui halaman login Pasien (/pasien/login).'
      return
    }
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('user', JSON.stringify(res.user))
    router.push('/bidan/dashboard')
  } catch (e) {
    error.value = 'Username atau password salah. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>