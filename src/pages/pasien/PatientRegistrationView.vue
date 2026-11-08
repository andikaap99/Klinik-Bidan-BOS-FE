<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <header class="flex items-center justify-between px-4 py-3 bg-white shadow-sm">
      <div class="flex items-center gap-2">
        <img src="@/assets/logo.jpeg" class="w-8 h-8 rounded-full" />
        <div>
          <div class="text-xs font-semibold text-[#B81D75]">Klinik Bunda Kasih</div>
          <div class="text-[10px] text-gray-500">Bdn. Okti Susanti, S.Keb</div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Bell class="w-5 h-5 text-gray-600" />
        <img src="@/assets/logo.jpeg" class="w-8 h-8 rounded-full" />
      </div>
    </header>
    <div class="max-w-md mx-auto px-4 mt-4">
      <div class="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <ClipboardList class="w-6 h-6 text-[#B81D75]" />
        <h1 class="font-bold text-slate-800">Registrasi Kunjungan Pasien</h1>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm mt-4">
        <div class="flex items-center gap-2 font-semibold text-slate-800 mb-3"><User class="w-5 h-5 text-[#B81D75]" /> Data Pasien</div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">NIK KTP / KIA (16 Digit)</label>
            <input v-model="form.nik" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" placeholder="16 digit" />
            <p class="text-xs text-gray-500 mt-1">Mencegah duplikasi data rekam medis pasien</p>
          </div>
          <div>
            <label class="text-sm font-semibold">Nama Lengkap Pasien</label>
            <input v-model="form.patientName" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" />
          </div>
          <div>
            <label class="text-sm font-semibold">Tanggal Lahir</label>
            <input v-model="form.birthDate" type="date" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" />
            <p class="text-xs text-gray-500 mt-1">Untuk kalkulasi umur otomatis & jadwal imunisasi/kehamilan</p>
          </div>
          <div>
            <label class="text-sm font-semibold">Jenis Kelamin</label>
            <div class="flex gap-2 mt-1">
              <button @click="form.gender='female'" :class="form.gender==='female'?'bg-[#B81D75] text-white':'bg-slate-100 text-slate-700'" class="flex-1 py-2 rounded-xl flex items-center justify-center gap-1"><User class="w-4 h-4"/>Perempuan</button>
              <button @click="form.gender='male'" :class="form.gender==='male'?'bg-[#B81D75] text-white':'bg-slate-100 text-slate-700'" class="flex-1 py-2 rounded-xl flex items-center justify-center gap-1"><User class="w-4 h-4"/>Laki-laki</button>
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold">Nama Penanggung Jawab</label>
            <input v-model="form.guardianName" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" placeholder="Dimas Aditya (Suami)" />
          </div>
          <div>
            <label class="text-sm font-semibold">No. HP / WhatsApp Aktif</label>
            <div class="relative mt-1">
              <Phone class="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
              <input v-model="form.phoneNumber" class="w-full bg-blue-50/50 rounded-xl pl-9 pr-3 py-3" />
            </div>
          </div>
          <div>
            <label class="text-sm font-semibold">Alamat Domisili</label>
            <textarea v-model="form.address" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" rows="2"></textarea>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm mt-4">
        <div class="flex items-center gap-2 font-semibold text-slate-800 mb-3"><Calendar class="w-5 h-5 text-[#B81D75]" /> Pendaftaran Kunjungan</div>
        <div class="space-y-3">
          <div>
            <label class="text-sm font-semibold">Tanggal Kunjungan</label>
            <input v-model="form.visitDate" type="date" class="w-full bg-blue-50/50 rounded-xl px-3 py-3 mt-1" />
          </div>
          <div>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold">Pilihan Layanan Klinik (8 Layanan)</span>
              <span class="text-xs text-[#B81D75]">Terpilih: {{ form.selectedService }}</span>
            </div>
            <div class="grid grid-cols-4 gap-2 mt-2">
              <button v-for="s in services" :key="s" @click="form.selectedService = s" :class="form.selectedService===s?'bg-[#B81D75] text-white':'bg-blue-50 text-slate-700'" class="py-2 rounded-xl text-xs font-medium">{{ s }}</button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 shadow-sm mt-4">
        <div class="font-semibold text-slate-800 mb-2">Keluhan</div>
        <p class="text-xs text-gray-500 mb-2">Catat alasan kedatangan pasien atau keluhan awal secara bebas...</p>
        <textarea v-model="form.complaint" class="w-full bg-blue-50/50 rounded-xl px-3 py-3" rows="3"></textarea>
      </div>

      <div class="flex flex-col gap-3 mt-4">
        <button @click="handleSubmit" class="w-full bg-[#B81D75] text-white rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-md"><UserCheck class="w-4 h-4" /> Simpan & Dapatkan Antrean</button>
        <button @click="handleCancel" class="w-full bg-slate-100 text-slate-700 rounded-full py-3 font-semibold flex items-center justify-center gap-2 shadow-sm"><ArrowLeft class="w-4 h-4" /> Batal / Kembali ke Menu Utama</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ClipboardList, User, Calendar, Phone, MapPin, Bell, Check, ArrowLeft, UserCheck } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()

interface RegistrationForm {
  nik: string; patientName: string; birthDate: string; gender: 'female'|'male'; guardianName: string; phoneNumber: string; address: string; visitDate: string; selectedService: string; complaint: string
}
const form = reactive<RegistrationForm>({
  nik: '', patientName: '', birthDate: '', gender: 'female', guardianName: '', phoneNumber: '', address: '', visitDate: '', selectedService: (route.query.service as string) || 'Ibu Hamil', complaint: ''
})

const services = ['Ibu Hamil','Ibu Bersalin','Imunisasi','KB','Berobat','Pijat Bayi','USG','Promil']

function handleSubmit() {
  // mock: set hasActiveQueue via localStorage flag
  localStorage.setItem('hasActiveQueue', 'true')
  router.push('/pasien/home')
}
function handleCancel() {
  router.push('/pasien/home')
}
</script>