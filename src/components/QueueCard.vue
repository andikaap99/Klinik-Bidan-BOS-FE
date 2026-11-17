<template>
  <div class="rounded-3xl bg-white p-5 shadow-sm border border-slate-100 font-sans">
    <div class="flex items-start justify-between">
      <div>
        <div class="text-[11px] font-bold tracking-wider text-slate-400 uppercase">NOMOR ANTREAN ANDA</div>
        <span :class="statusBadgeClass" class="inline-block mt-1 text-xs font-semibold px-2 py-1 rounded-full">{{ statusLabel }}</span>
      </div>
      <div class="text-3xl font-extrabold text-pink-600">{{ formattedQueue }}</div>
    </div>
    <div class="mt-4 space-y-1 text-sm">
      <div class="flex justify-between"><span class="text-slate-500">Layanan</span><span class="font-semibold text-slate-800">{{ serviceName }}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Sesi</span><span class="font-semibold text-slate-800">{{ formattedSesi }}</span></div>
      <div class="flex justify-between"><span class="text-slate-500">Perkiraan Dipanggil</span><span class="font-semibold text-pink-600">{{ formattedTime }}</span></div>
    </div>
    <div class="grid grid-cols-3 gap-2 text-center bg-slate-50/80 p-3 rounded-2xl border border-slate-100 mt-4">
      <div>
        <div class="text-[11px] text-slate-500">Di Depan Anda</div>
        <div class="font-semibold text-slate-800">{{ antreanDiDepan }} Pasien</div>
      </div>
      <div>
        <div class="text-[11px] text-slate-500">Estimasi Tunggu</div>
        <div class="font-semibold text-slate-800">± {{ estimasiMenit }} Mnt</div>
      </div>
      <div>
        <div class="text-[11px] text-slate-500">Jam Dipanggil</div>
        <div class="font-semibold text-slate-800">{{ shortTime }}</div>
      </div>
    </div>
    <div v-if="status === 'antre' || status === 'dipanggil'" class="mt-4 pt-3 border-t border-slate-100">
      <button :disabled="isCancelling" @click="showConfirm = true" class="text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl py-2.5 w-full font-medium text-xs transition-colors disabled:opacity-50">
        {{ isCancelling ? 'Membatalkan...' : 'Batalkan Kunjungan' }}
      </button>
    </div>
    <div v-if="showConfirm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl p-5 max-w-sm mx-4 shadow-xl text-center">
        <p class="text-slate-800 font-semibold mb-3">Batalkan kunjungan ini?</p>
        <div class="flex gap-2">
          <button @click="showConfirm = false" class="flex-1 border rounded-xl py-2 text-sm">Tidak</button>
          <button @click="confirmCancel" :disabled="isCancelling" class="flex-1 bg-rose-600 text-white rounded-xl py-2 text-sm disabled:opacity-50">Ya, Batalkan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
const emit = defineEmits(['cancel'])
const props = defineProps<{
  visitId: string
  queueNumber: number | string
  serviceName?: string
  sesi: string
  status: 'antre' | 'dipanggil' | 'diperiksa' | 'selesai' | 'batal'
  antreanDiDepan: number
  estimasiMenit: number
  perkiraanDipanggil: string
}>()

const isCancelling = ref(false)
const showConfirm = ref(false)
async function confirmCancel() {
  isCancelling.value = true
  emit('cancel', props.visitId)
  showConfirm.value = false
  isCancelling.value = false
}
const formattedQueue = computed(() => {
  const n = Number(props.queueNumber)
  return isNaN(n) ? String(props.queueNumber) : `B-${String(n).padStart(3, '0')}`
})
const formattedSesi = computed(() => props.sesi === 'pagi_siang' ? 'Pagi / Siang' : props.sesi === 'sore_malam' ? 'Sore / Malam' : props.sesi)
const formattedTime = computed(() => formatTime(props.perkiraanDipanggil))
const shortTime = computed(() => formatTime(props.perkiraanDipanggil, true))
function formatTime(iso: string, short = false) {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return short ? `${hh}:${mm}` : `${hh}:${mm} WIB`
}
const statusLabel = computed(() => ({ antre:'Antre', dipanggil:'Dipanggil', diperiksa:'Diperiksa', selesai:'Selesai', batal:'Batal' }[props.status] || props.status))
const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    antre: 'bg-amber-100 text-amber-700',
    dipanggil: 'bg-blue-100 text-blue-700',
    diperiksa: 'bg-purple-100 text-purple-700',
    selesai: 'bg-green-100 text-green-700',
    batal: 'bg-red-100 text-red-700',
  }
  return map[props.status] || 'bg-slate-100 text-slate-700'
})
</script>