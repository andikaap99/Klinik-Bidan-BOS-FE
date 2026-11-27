<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-800 flex items-center justify-center"
        >
          <Calendar class="w-4 h-4" />
        </div>
        <h1 class="text-lg font-bold text-[#14234B]">Daftar Kunjungan Pasien Hari Ini</h1>
      </div>
      <button
        class="bg-[#14234B] hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 transition-colors"
      >
        <UserPlus class="w-4 h-4" /> Pasien Darurat
      </button>
    </div>

    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-none">
      <div class="flex flex-wrap items-center gap-3 mb-6">
        <div class="flex-1 min-w-[220px] max-w-xs relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="search"
            placeholder="Cari antrean hari ini..."
            class="w-full bg-slate-100/80 border-0 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-700 placeholder-slate-400"
          />
        </div>
        <div class="flex items-center gap-2">
          <button
            v-for="f in filters"
            :key="f"
            @click="activeFilter = f"
            class="text-xs px-4 py-2 rounded-full"
            :class="
              activeFilter === f
                ? 'bg-[#14234B] text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 font-medium'
            "
          >
            {{ f }}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead
            class="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500"
          >
            <tr>
              <th class="px-3 py-3 rounded-l-xl">NO. REKAM MEDIS</th>
              <th class="px-3 py-3">TANGGAL & WAKTU KUNJUNGAN</th>
              <th class="px-3 py-3">PILIHAN LAYANAN</th>
              <th class="px-3 py-3">STATUS KUNJUNGAN</th>
              <th class="px-3 py-3 rounded-r-xl text-right">AKSI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in filtered"
              :key="row.rm"
              :class="
                row.status === 'Sedang Diperiksa'
                  ? 'bg-rose-50/40'
                  : 'bg-white border-b border-slate-100 hover:bg-slate-50/50'
              "
            >
              <td class="px-3 py-3">
                <span
                  class="bg-blue-50 text-blue-600 font-bold text-xs px-3 py-1 rounded-lg inline-block"
                  >{{ row.rm }}</span
                >
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-1">
                  <Clock class="w-3.5 h-3.5 text-slate-400" /><span
                    class="text-xs font-bold text-slate-700"
                    >{{ row.waktu }}</span
                  >
                </div>
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-700"></span
                  ><span class="text-xs font-semibold text-slate-700">{{ row.layanan }}</span>
                </div>
              </td>
              <td class="px-3 py-3">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold"
                  :class="statusClass(row.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(row.status)"></span
                  >{{ row.status }}
                </span>
              </td>
              <td class="px-3 py-3 text-right">
                <button
                  @click="router.push(`/bidan/antrean/${row.rm}`)"
                  class="bg-blue-50 hover:bg-blue-100 text-[#14234B] font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors"
                >
                  Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between pt-4 mt-2 text-xs text-slate-500">
        <div>
          Menampilkan <span class="font-bold text-slate-800">1-6</span> dari
          <span class="font-bold text-slate-800">8</span> antrean hari ini
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-medium cursor-not-allowed"
          >
            Sebelumnya
          </button>
          <span
            class="w-7 h-7 rounded-lg bg-[#14234B] text-white font-bold flex items-center justify-center"
            >1</span
          >
          <span
            class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium flex items-center justify-center"
            >2</span
          >
          <button
            class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, UserPlus, Search, Clock } from 'lucide-vue-next'

const router = useRouter()
const search = ref('')
const activeFilter = ref('Semua (8)')
const filters = ['Semua (8)', 'Sedang Diperiksa (3)', 'Dalam Antrean (1)', 'Selesai (2)']

const rows = [
  {
    rm: 'RM-2024-0891',
    waktu: '24 Okt 2024, 08:30 WIB',
    layanan: 'Pemeriksaan Ibu Hamil (ANC)',
    status: 'Sedang Diperiksa',
  },
  {
    rm: 'RM-2024-0892',
    waktu: '24 Okt 2024, 09:15 WIB',
    layanan: 'Pemeriksaan USG 2D/3D',
    status: 'Dalam Antrean',
  },
  {
    rm: 'RM-2024-0893',
    waktu: '24 Okt 2024, 09:45 WIB',
    layanan: 'Keluarga Berencana (KB)',
    status: 'Dalam Antrean',
  },
  {
    rm: 'RM-2024-0894',
    waktu: '24 Okt 2024, 08:00 WIB',
    layanan: 'Imunisasi Bayi (BCG/Polio)',
    status: 'Selesai',
  },
  {
    rm: 'RM-2024-0895',
    waktu: '24 Okt 2024, 07:30 WIB',
    layanan: 'Pijat Bayi & Anak',
    status: 'Selesai',
  },
]

const filtered = computed(() =>
  rows.filter((r) => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || r.rm.toLowerCase().includes(q) || r.layanan.toLowerCase().includes(q)
    let matchStatus = true
    if (activeFilter.value.startsWith('Sedang')) matchStatus = r.status === 'Sedang Diperiksa'
    else if (activeFilter.value.startsWith('Dalam')) matchStatus = r.status === 'Dalam Antrean'
    else if (activeFilter.value.startsWith('Selesai')) matchStatus = r.status === 'Selesai'
    return matchSearch && matchStatus
  }),
)

function statusClass(s: string) {
  if (s === 'Sedang Diperiksa') return 'bg-[#6B1D2F] text-white'
  if (s === 'Dalam Antrean') return 'bg-rose-100 text-rose-800'
  return 'bg-indigo-100/80 text-indigo-600'
}
function statusDot(s: string) {
  if (s === 'Sedang Diperiksa') return 'bg-white'
  if (s === 'Dalam Antrean') return 'bg-[#6B1D2F]'
  return 'bg-indigo-600'
}
</script>
