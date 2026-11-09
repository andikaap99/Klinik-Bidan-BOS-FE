<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <TopHeader title="Registrasi Pasien (1/3)" back="/pasien/home" />
    <div class="max-w-md mx-auto px-4 mt-4 space-y-4">
      <div class="bg-white rounded-2xl p-4 shadow-sm">
        <h1 class="font-bold text-slate-800 mb-3">Data Pasien</h1>
        <div class="space-y-3">
          <label class="text-xs text-gray-500">NIK <span class="text-red-500">*</span></label>
          <input v-model="form.nik" placeholder="NIK" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <label class="text-xs text-gray-500">Nama Lengkap <span class="text-red-500">*</span></label>
          <input v-model="form.patientName" placeholder="Nama Lengkap" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <label class="text-xs text-gray-500">Tanggal Lahir <span class="text-red-500">*</span></label>
          <input v-model="form.birthDate" type="date" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <div class="flex gap-2">
            <button @click="form.gender='female'" class="flex-1 py-2 rounded-xl" :class="form.gender==='female'?'bg-[#B81D75] text-white':'bg-slate-100'">Perempuan</button>
            <button @click="form.gender='male'" class="flex-1 py-2 rounded-xl" :class="form.gender==='male'?'bg-[#B81D75] text-white':'bg-slate-100'">Laki-laki</button>
          </div>
          <label class="text-xs text-gray-500">Penanggung Jawab <span class="text-red-500">*</span></label>
          <input v-model="form.guardianName" placeholder="Penanggung Jawab" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <label class="text-xs text-gray-500">No. WA <span class="text-red-500">*</span></label>
          <input v-model="form.phoneNumber" placeholder="No WA" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" />
          <label class="text-xs text-gray-500">Alamat <span class="text-red-500">*</span></label>
          <textarea v-model="form.address" placeholder="Alamat" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" rows="2"></textarea>
        </div>
        <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
        <button @click="handleSubmit" class="w-full mt-4 bg-[#B81D75] text-white rounded-full py-3 font-semibold">Lanjut</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopHeader from '@/components/TopHeader.vue'
const router = useRouter()
const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const errorMessage = ref('')
const form = reactive({ nik:'', patientName:'', birthDate:'', gender:'female' as 'female'|'male', guardianName:'', phoneNumber:'', address:'' })
onMounted(async () => {
  const token = localStorage.getItem('token') || ''
  const res = await fetch(`${base}/me`, { headers: { Authorization: `Bearer ${token}` } })
  if (res.ok) {
    const data = await res.json()
    form.patientName = data.nama_lengkap || ''
    form.phoneNumber = data.nomor_wa || ''
  }
})
async function handleSubmit() {
  errorMessage.value = ''
  const token = localStorage.getItem('token') || ''
  try {
    const res = await fetch(`${base}/patients`, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ nik:form.nik, nama_lengkap:form.patientName, tanggal_lahir:form.birthDate, jenis_kelamin:form.gender==='female'?'P':'L', nama_penanggung_jawab:form.guardianName, nomor_wa:form.phoneNumber, alamat:form.address }) })
    if(!res.ok) throw new Error('Gagal menyimpan data pasien')
    const data = await res.json()
    localStorage.setItem('regPatientId', data.id)
    router.push('/pasien/reg-step2')
  } catch(e:any){ errorMessage.value = e?.message || 'Terjadi kesalahan' }
}
</script>