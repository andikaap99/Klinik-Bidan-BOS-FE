import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/pasien/Home.vue'
import Login from '../pages/pasien/Login.vue'
import Register from '../pages/pasien/Register.vue'
import Profile from '../pages/pasien/Profile.vue'
import PatientRegistrationView from '../pages/pasien/PatientRegistrationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pasien/home' },
    { path: '/pasien/home', name: 'pasien-home', component: Home },
    { path: '/pasien/login', name: 'pasien-login', component: Login },
    { path: '/pasien/register', name: 'pasien-register', component: Register },
{ path: '/pasien/profile', name: 'pasien-profile', component: Profile },
{ path: '/pasien/register-visit', name: 'pasien-register-visit', component: PatientRegistrationView },
    { path: '/bidan', name: 'bidan', component: { template: '<div style="padding:24px;text-align:center;color:#B81D75">Halaman Bidan (coming soon)</div>' } },
  ],
})

export default router