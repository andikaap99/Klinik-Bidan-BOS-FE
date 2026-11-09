import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/pasien/Home.vue'
import Login from '../pages/pasien/Login.vue'
import Register from '../pages/pasien/Register.vue'
import Profile from '../pages/pasien/ProfileView.vue'
import EditProfileView from '../pages/pasien/EditProfileView.vue'
import RegStep1 from '../pages/pasien/RegStep1.vue'
import RegStep2 from '../pages/pasien/RegStep2.vue'
import RegResult from '../pages/pasien/RegResult.vue'
import ChangePasswordView from '../pages/pasien/ChangePasswordView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/pasien/home' },
    { path: '/pasien/home', name: 'pasien-home', component: Home },
    { path: '/pasien/login', name: 'pasien-login', component: Login },
    { path: '/pasien/register', name: 'pasien-register', component: Register },
{ path: '/pasien/profile', name: 'pasien-profile', component: Profile },
{ path: '/pasien/edit-profile', name: 'pasien-edit-profile', component: EditProfileView },
{ path: '/pasien/change-password', name: 'pasien-change-password', component: ChangePasswordView },

{ path: '/pasien/reg-step1', name: 'pasien-reg-step1', component: RegStep1 },
{ path: '/pasien/reg-step2', name: 'pasien-reg-step2', component: RegStep2 },
{ path: '/pasien/reg-result', name: 'pasien-reg-result', component: RegResult },
    { path: '/bidan', name: 'bidan', component: { template: '<div style="padding:24px;text-align:center;color:#B81D75">Halaman Bidan (coming soon)</div>' } },
  ],
})

export default router