const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const authService = {
  async login(payload: { username: string; password: string }) {
    const res = await fetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error('INVALID_CREDENTIALS')
    return res.json()
  },
  async register(payload: { nama?: string; nama_lengkap?: string; whatsapp?: string; nomor_wa?: string; username: string; password: string }) {
    const body = { nama_lengkap: payload.nama_lengkap || payload.nama, nomor_wa: payload.nomor_wa || payload.whatsapp, username: payload.username, password: payload.password }
    const res = await fetch(`${base}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (!res.ok) throw new Error('REGISTER_FAILED')
    return res.json()
  },
}