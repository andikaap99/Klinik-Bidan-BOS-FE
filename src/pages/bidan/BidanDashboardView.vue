<template>
  <div class="min-h-screen">
    <main class="p-6 md:p-8 bg-slate-50/70">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Dashboard & Prediksi Analitik Klinik</h1>
          <p class="text-xs text-slate-500">Operasional klinik</p>
        </div>
        <div class="flex gap-2">
          <input type="date" v-model="dateFrom" class="border rounded-xl px-3 py-2 text-sm" />
          <input type="date" v-model="dateTo" class="border rounded-xl px-3 py-2 text-sm" />
        </div>
      </div>

      <div v-if="insight" class="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-blue-700">Insight Analitik</span>
          <span v-if="insight.dari_cache" class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Dari Cache</span>
        </div>
        <p class="text-sm text-slate-700 mt-2">{{ insight.narasi }}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-slate-400">{{ insight.generated_at }}</span>
          <button @click="refreshInsight" class="text-xs text-blue-600 font-semibold">Perbarui Analisis</button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-xs text-slate-500">Total Kunjungan</div>
          <div class="text-2xl font-extrabold text-slate-900">{{ summary?.total_kunjungan ?? 0 }}</div>
          <div class="text-xs text-slate-400">{{ summary?.rata_kunjungan_per_hari ?? 0 }}/hari</div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-xs text-slate-500">Kunjungan Selesai</div>
          <div class="text-2xl font-extrabold text-emerald-600">{{ summary?.selesai ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-xs text-slate-500">Kunjungan Batal</div>
          <div class="text-2xl font-extrabold text-rose-600">{{ summary?.batal ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-xs text-slate-500">Pasien Unik</div>
          <div class="text-2xl font-extrabold text-slate-900">{{ summary?.pasien_unik ?? 0 }}</div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="text-xs text-slate-500">Pasien Baru</div>
          <div class="text-2xl font-extrabold text-blue-600">{{ summary?.pasien_baru ?? 0 }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="font-bold text-slate-900 mb-4">Prediksi Tren Kedatangan 7 Hari</h2>
          <div v-if="!prediction || !prediction.data?.length" class="text-sm text-slate-500">Model prediksi belum dijalankan. Prediksi akan diperbarui otomatis oleh sistem terjadwal.</div>
          <div v-else class="grid grid-cols-7 gap-2">
            <button v-for="d in prediction.data" :key="d.target_date" @click="selectedDate = d.target_date" class="border rounded-xl p-2 text-center text-xs" :class="isPeak(d) ? 'border-rose-300 bg-rose-50/40 text-rose-700' : ''">
              <div>{{ dayName(d.target_date) }}</div>
              <div class="font-bold">{{ Number(d.total).toFixed(1) }}</div>
              <div v-if="isPeak(d)" class="text-[10px]">PUNCAK</div>
            </button>
          </div>
        </div>
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="font-bold text-slate-900 mb-4">Prediksi Pasien Per Layanan</h2>
          <div class="text-xs text-slate-500 mb-2">{{ selectedDate }}</div>
          <div v-for="l in selectedLayanan" :key="l.nama" class="bg-slate-50 rounded-xl px-4 py-3 flex justify-between items-center mb-2">
            <span class="text-sm">{{ l.nama }}</span>
            <span class="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full">{{ l.predicted_count }} Orang</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 mb-4">
            <select v-model="trendInterval" class="border rounded-xl px-2 py-1 text-xs"><option value="day">day</option><option value="week">week</option><option value="month">month</option></select>
            <select v-model="trendSesi" class="border rounded-xl px-2 py-1 text-xs"><option value="all">all</option><option value="pagi_siang">pagi_siang</option><option value="sore_malam">sore_malam</option></select>
          </div>
          <div v-for="p in trend?.points" :key="p.tanggal" class="flex justify-between text-xs border-b py-1">
            <span>{{ p.tanggal }}</span><span>{{ p.total }}</span>
          </div>
        </div>
        <div class="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 class="font-bold text-slate-900 mb-4">Sebaran Kunjungan</h2>
          <div v-for="s in breakdown?.per_sesi" :key="s.sesi" class="mb-2">
            <div class="flex justify-between text-xs"><span>{{ s.sesi }}</span><span>{{ s.total }}</span></div>
            <div class="h-2 bg-slate-100 rounded-full"><div class="h-2 bg-blue-600 rounded-full" :style="{ width: pct(s.total, breakdown?.per_sesi) + '%' }"></div></div>
          </div>
          <div class="mt-4 space-y-1">
            <div v-for="l in breakdown?.per_layanan" :key="l.nama" class="flex justify-between text-xs"><span>{{ l.nama }}</span><span>{{ l.total }}</span></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'BidanDashboardView' })
import { ref, computed, onMounted, watch } from 'vue'

const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const token = localStorage.getItem('token') || ''

const dateFrom = ref('')
const dateTo = ref('')
const summary = ref<any>(null)
const insight = ref<any>(null)
const prediction = ref<any>(null)
const trend = ref<any>(null)
const breakdown = ref<any>(null)
const selectedDate = ref('')
const trendInterval = ref('day')
const trendSesi = ref('all')

const selectedLayanan = computed(() => {
  const d = prediction.value?.data?.find((x: any) => x.target_date === selectedDate.value)
  return d?.layanan || []
})

function isPeak(d: any) {
  const max = Math.max(...(prediction.value?.data || []).map((x: any) => x.total))
  return d.total === max
}
function dayName(d: string) { return new Date(d).toLocaleDateString('id-ID', { weekday: 'short' }) }
function pct(val: number, arr: any[]) {
  const total = arr?.reduce((a: number, b: any) => a + b.total, 0) || 1
  return (val / total) * 100
}

async function fetchAll(refresh = false) {
  const qs = `date_from=${dateFrom.value}&date_to=${dateTo.value}`
  const [s, i, p, t, b] = await Promise.all([
    fetch(`${base}/analytics/summary?${qs}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`${base}/analytics/insight?${qs}${refresh ? '&refresh=true' : ''}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`${base}/predict?${qs}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`${base}/analytics/trend?${qs}&interval=${trendInterval.value}&sesi=${trendSesi.value}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    fetch(`${base}/analytics/breakdown?${qs}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
  ])
  summary.value = s; insight.value = i; prediction.value = p; trend.value = t; breakdown.value = b
  if (p?.data?.length) selectedDate.value = p.data[0].target_date
}

function refreshInsight() { fetchAll(true) }

onMounted(() => {
  const now = new Date()
  const from = new Date(now.getTime() - 30 * 86400000)
  dateTo.value = now.toISOString().slice(0, 10)
  dateFrom.value = from.toISOString().slice(0, 10)
  fetchAll()
})

watch([trendInterval, trendSesi], () => fetchAll())
</script>