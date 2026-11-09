<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Registrasi Pasien (2/3)" back="/pasien/reg-step1" />
    <div class="max-w-md mx-auto px-4 mt-4 space-y-4">
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h1 class="font-bold text-slate-800 mb-3">Pendaftaran Kunjungan</h1>
        <div class="space-y-3">
          <label class="text-xs text-gray-500">Tanggal Kunjungan <span class="text-red-500">*</span></label>
          <input v-model="form.visitDate" type="date" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <label class="text-xs text-gray-500">Layanan <span class="text-red-500">*</span></label>
          <select v-model="form.selectedService" class="w-full bg-blue-50/50 rounded-xl px-3 py-3">
            <option v-for="s in services" :key="s" :value="s">{{ s }}</option>
          </select>
          <label class="text-xs text-gray-500">Keluhan</label>
          <textarea v-model="form.complaint" placeholder="Keluhan" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" rows="3"></textarea>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
        <button @click="handleSubmit" class="w-full mt-4 bg-[#B81D75] text-white rounded-full py-3 font-semibold">Lanjut</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import TopHeader from '@/components/TopHeader.vue'
const router = useRouter()
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const errorMessage = ref('')
const services = ['Ibu Hamil','Ibu Bersalin','Imunisasi','KB','Berobat','Pijat Bayi','USG','Promil']
const serviceMap: Record<string, number> = { 'Ibu Hamil':1,'Ibu Bersalin':2,'Imunisasi':3,'KB':4,'Berobat':5,'Pijat Bayi':6,'USG':7,'Promil':8 }
const form = reactive({ visitDate: new Date().toISOString().split('T')[0], selectedService: 'Ibu Hamil', complaint: '' })
async function handleSubmit() {
  errorMessage.value = ''
  const token = localStorage.getItem('token') || ''
  const patientId = localStorage.getItem('regPatientId') || ''
  try {
    const res = await fetch(`${base}/visits`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ patient_id: patientId, service_id: serviceMap[form.selectedService] || 1, visit_date: form.visitDate, sesi: 'pagi_siang', keluhan: form.complaint }) })
    if(!res.ok) throw new Error('Gagal membuat antrean')
    const data = await res.json()
    localStorage.setItem('regResult', JSON.stringify(data))
    router.push('/pasien/reg-result')
  } catch(e:any){ errorMessage.value = e?.message || 'Terjadi kesalahan' }
}
</script>