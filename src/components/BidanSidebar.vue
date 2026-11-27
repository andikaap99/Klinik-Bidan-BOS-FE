<template>
  <aside class="w-64 min-h-screen bg-white border-r border-slate-100 flex flex-col justify-between p-5">
    <div>
      <div class="flex items-center gap-3 px-2 mb-8">
        <img src="@/assets/logo.jpeg" alt="logo" class="w-10 h-10 object-contain rounded-lg" />
        <div>
          <div class="text-base font-extrabold text-slate-900 leading-tight">BidanCare</div>
          <div class="text-[11px] font-medium text-blue-600 leading-tight">Praktik Mandiri Bidan</div>
        </div>
      </div>
      <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 mb-3 block">MENU UTAMA</span>
      <nav class="space-y-1.5">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="flex items-center gap-2 px-3.5 py-3 rounded-xl text-xs transition-colors" :class="isActive(item.path) ? 'bg-slate-900 text-white font-semibold' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'">
          <component :is="item.icon" class="w-4 h-4" :class="isActive(item.path) ? 'text-white' : 'text-slate-500'" />
          {{ item.label }}
        </router-link>
      </nav>
    </div>
    <div class="border-t border-slate-100 pt-4 mt-auto flex items-center gap-2">
      <div class="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">BR</div>
      <div class="flex-1">
        <div class="text-xs font-semibold text-slate-800">Bdn. Rina</div>
        <div class="text-[11px] text-slate-400">Bidan Praktik</div>
      </div>
      <button @click="logout" class="text-slate-400 hover:text-rose-600"><LogOut class="w-4 h-4" /></button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutDashboard, Users, ClipboardList, LogOut } from 'lucide-vue-next'
const route = useRoute()
const router = useRouter()
const user = computed(() => JSON.parse(localStorage.getItem('user') || '{}'))
const navItems = [
  { label: 'Dashboard', path: '/bidan/dashboard', icon: LayoutDashboard },
  { label: 'Pasien & Antrean', path: '/bidan/antrean', icon: Users },
  { label: 'Asuhan & Rekam Medis', path: '/bidan/rekam-medis', icon: ClipboardList },
]
function isActive(p: string) { return p === '/bidan/antrean' ? route.path.startsWith('/bidan/antrean') : route.path === p }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/bidan/login') }
</script>