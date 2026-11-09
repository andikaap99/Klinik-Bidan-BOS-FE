import { db, uid } from './db'

function json(res: any, status: number, data: any) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c: any) => (b += c))
    req.on('end', () => { try { resolve(b ? JSON.parse(b) : {}) } catch { resolve({}) } })
  })
}

function auth(req: any) {
  const h = req.headers.authorization || ''
  const t = h.startsWith('Bearer ') ? h.slice(7) : ''
  return db.users.find((u: any) => u.id === t) || null
}

function paginate(items: any[], limit: number, offset: number) {
  const l = Math.min(Number(limit) || 20, 100)
  const o = Number(offset) || 0
  return { items: items.slice(o, o + l), total: items.length, limit: l, offset: o }
}

export async function handle(req: any, res: any, next: any) {
  const url = new URL(req.url, 'http://x')
  const path = url.pathname.replace(/^\/api\/v1/, '')
  const method = req.method

  // health
  if (path === '/health' && method === 'GET') return json(res, 200, { status: 'ok', db: 'ok' })

  // register
  if (path === '/register' && method === 'POST') {
    const b = await parseBody(req)
    if (db.users.find((u: any) => u.username.toLowerCase() === (b.username || '').toLowerCase())) return json(res, 409, { code: 'USERNAME_TAKEN', message: 'Username sudah dipakai' })
    const u = { id: uid(), username: b.username, nama_lengkap: b.nama_lengkap, nomor_wa: b.nomor_wa, role: 'pasien', password: b.password, created_at: new Date().toISOString() }
    db.users.push(u)
    return json(res, 201, { id: u.id, username: u.username, nama_lengkap: u.nama_lengkap, role: u.role })
  }

  // login
  if (path === '/login' && method === 'POST') {
    const b = await parseBody(req)
    const u = db.users.find((x: any) => x.username.toLowerCase() === (b.username || '').toLowerCase() && x.password === b.password)
    if (!u) return json(res, 401, { code: 'INVALID_CREDENTIALS', message: 'Kredensial tidak valid' })
    return json(res, 200, { access_token: u.id, token_type: 'bearer', expires_in: 3600, user: { id: u.id, username: u.username, nama_lengkap: u.nama_lengkap, role: u.role } })
  }

  const user = auth(req)
  if (!user && path !== '/health') { /* allow some public already handled */ }

  // /me
  if (path === '/me') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    if (method === 'GET') return json(res, 200, { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap, nomor_wa: user.nomor_wa, role: user.role })
    if (method === 'PATCH') {
      const b = await parseBody(req)
      if (b.username && b.username !== user.username) {
        if (db.users.find((u: any) => u.username.toLowerCase() === b.username.toLowerCase())) return json(res, 409, { code: 'USERNAME_TAKEN', message: 'Username sudah dipakai' })
        user.username = b.username
      }
      if (b.nama_lengkap) user.nama_lengkap = b.nama_lengkap
      if (b.nomor_wa) user.nomor_wa = b.nomor_wa
      return json(res, 200, { id: user.id, username: user.username, nama_lengkap: user.nama_lengkap, nomor_wa: user.nomor_wa, role: user.role })
    }
  }
  if (path === '/me/password' && method === 'POST') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    const b = await parseBody(req)
    if (user.password !== b.password_lama) return json(res, 403, { code: 'FORBIDDEN', message: 'Password lama salah' })
    user.password = b.password_baru
    return json(res, 200, { message: 'Password berhasil diubah' })
  }

  // patients
  if (path === '/patients') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    if (method === 'GET') {
      const mine = db.patients.filter((p: any) => p.account_id === user.id)
      return json(res, 200, paginate(mine.map((p: any) => ({ id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap, tanggal_lahir: p.tanggal_lahir, jenis_kelamin: p.jenis_kelamin, nama_penanggung_jawab: p.nama_penanggung_jawab })), url.searchParams.get('limit') || 20, url.searchParams.get('offset') || 0))
    }
    if (method === 'POST') {
      const b = await parseBody(req)
      const p = { id: uid(), account_id: user.id, no_rm: 'RM-' + String(db.patients.length + 1).padStart(6, '0'), ...b }
      db.patients.push(p)
      return json(res, 201, p)
    }
  }
  if (path === '/patients/claim' && method === 'POST') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    const b = await parseBody(req)
    const p = db.patients.find((x: any) => x.nik === b.nik && x.tanggal_lahir === b.tanggal_lahir && !x.account_id)
    if (!p) return json(res, 409, { code: 'CLAIM_FAILED', message: 'Gagal klaim' })
    p.account_id = user.id
    return json(res, 200, p)
  }
  const pm = path.match(/^\/patients\/([^/]+)$/)
  if (pm) {
    const p = db.patients.find((x: any) => x.id === pm[1])
    if (!p) return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
    if (method === 'GET') return json(res, 200, p)
    if (method === 'PATCH') {
      if (user?.id !== p.account_id) return json(res, 403, { code: 'FORBIDDEN', message: 'Forbidden' })
      const b = await parseBody(req)
      Object.assign(p, b)
      if (b.nik) delete b.nik
      return json(res, 200, p)
    }
  }
  const mergeM = path.match(/^\/patients\/([^/]+)\/merge$/)
  if (mergeM && method === 'POST') {
    const b = await parseBody(req)
    return json(res, 200, { survivor_id: b.survivor_id, merged_id: mergeM[1], kunjungan_dipindah: 0 })
  }

  // services
  if (path === '/services' && method === 'GET') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    const items = user.role === 'bidan' ? db.services : db.services.map(({ avg_duration_minutes, ...r }: any) => r)
    return json(res, 200, paginate(items, url.searchParams.get('limit') || 20, url.searchParams.get('offset') || 0))
  }

  // visits
  if (path === '/visits' && method === 'POST') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    const b = await parseBody(req)
    const patient = db.patients.find((p: any) => p.id === b.patient_id && p.account_id === user.id)
    if (!patient) return json(res, 404, { code: 'NOT_FOUND', message: 'Pasien tidak ada' })
    const dup = db.visits.find((v: any) => v.patient_id === b.patient_id && v.service_id === b.service_id && v.visit_date === b.visit_date && v.status !== 'batal')
    if (dup) return json(res, 409, { code: 'VISIT_DUPLICATE', message: 'Duplikat' })
    const key = b.visit_date + '|' + b.sesi
    db.queueCounter[key] = (db.queueCounter[key] || 0) + 1
    const service = db.services.find((s: any) => s.id === b.service_id)
    const v = { id: uid(), patient_id: b.patient_id, service: { id: service.id, nama: service.nama }, visit_date: b.visit_date, sesi: b.sesi, queue_number: db.queueCounter[key], status: 'antre', keluhan: b.keluhan || null, registered_at: new Date().toISOString(), started_at: null, finished_at: null }
    db.visits.push(v)
    return json(res, 201, { id: v.id, patient_id: v.patient_id, service: v.service, visit_date: v.visit_date, sesi: v.sesi, queue_number: v.queue_number, status: v.status })
  }
  if (path === '/visits' && method === 'GET') {
    if (!user) return json(res, 401, { code: 'TOKEN_EXPIRED', message: 'Belum login' })
    let list = db.visits
    if (user.role === 'pasien') {
      const myPts = db.patients.filter((p: any) => p.account_id === user.id).map((p: any) => p.id)
      list = list.filter((v: any) => myPts.includes(v.patient_id))
    }
    const pid = url.searchParams.get('patient_id'); if (pid) list = list.filter((v: any) => v.patient_id === pid)
    const st = url.searchParams.get('status'); if (st) list = list.filter((v: any) => v.status === st)
    const vd = url.searchParams.get('visit_date'); if (vd) list = list.filter((v: any) => v.visit_date === vd)
    const items = list.map((v: any) => {
      const p = db.patients.find((x: any) => x.id === v.patient_id)
      return { id: v.id, patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, service: v.service, visit_date: v.visit_date, sesi: v.sesi, queue_number: v.queue_number, status: v.status }
    })
    return json(res, 200, paginate(items, url.searchParams.get('limit') || 20, url.searchParams.get('offset') || 0))
  }
  const vm = path.match(/^\/visits\/([^/]+)$/)
  if (vm && method === 'GET') {
    const v = db.visits.find((x: any) => x.id === vm[1])
    if (!v) return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
    const p = db.patients.find((x: any) => x.id === v.patient_id)
    return json(res, 200, { id: v.id, patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, service: v.service, visit_date: v.visit_date, sesi: v.sesi, queue_number: v.queue_number, status: v.status, keluhan: v.keluhan, registered_at: v.registered_at, started_at: v.started_at, finished_at: v.finished_at })
  }
  const cancelM = path.match(/^\/visits\/([^/]+)\/cancel$/)
  if (cancelM && method === 'POST') {
    const v = db.visits.find((x: any) => x.id === cancelM[1])
    if (!v) return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
    if (v.status !== 'antre' && !(user?.role === 'bidan' && v.status === 'diperiksa')) return json(res, 409, { code: 'VISIT_NOT_CANCELLABLE', message: 'Tidak bisa dibatalkan' })
    v.status = 'batal'
    const p = db.patients.find((x: any) => x.id === v.patient_id)
    return json(res, 200, { id: v.id, patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, service: v.service, visit_date: v.visit_date, sesi: v.sesi, queue_number: v.queue_number, status: v.status, keluhan: v.keluhan, registered_at: v.registered_at, started_at: v.started_at, finished_at: v.finished_at })
  }
  const statusM = path.match(/^\/visits\/([^/]+)\/status$/)
  if (statusM && method === 'PATCH') {
    const v = db.visits.find((x: any) => x.id === statusM[1])
    if (!v) return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
    const b = await parseBody(req)
    if (b.status === 'diperiksa' && v.status === 'antre') { v.status = 'diperiksa'; v.started_at = new Date().toISOString() }
    else if (b.status === 'selesai' && v.status === 'diperiksa') { v.status = 'selesai'; v.finished_at = new Date().toISOString() }
    else return json(res, 409, { code: 'INVALID_STATUS_TRANSITION', message: 'Transisi tidak valid' })
    const p = db.patients.find((x: any) => x.id === v.patient_id)
    return json(res, 200, { id: v.id, patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, service: v.service, visit_date: v.visit_date, sesi: v.sesi, queue_number: v.queue_number, status: v.status, keluhan: v.keluhan, registered_at: v.registered_at, started_at: v.started_at, finished_at: v.finished_at })
  }

  // estimation
  if (path === '/estimation' && method === 'GET') {
    const vid = url.searchParams.get('visit_id')
    const v = db.visits.find((x: any) => x.id === vid)
    if (!v || v.status === 'selesai' || v.status === 'batal') return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
    const ahead = db.visits.filter((x: any) => x.visit_date === v.visit_date && x.sesi === v.sesi && (x.status === 'antre' || x.status === 'diperiksa') && x.queue_number < v.queue_number).length
    return json(res, 200, { visit_id: v.id, queue_number: v.queue_number, sesi: v.sesi, status: v.status, antrean_di_depan: ahead, estimasi_menit: ahead * 30, perkiraan_dipanggil: new Date(Date.now() + ahead * 30 * 60000).toISOString() })
  }

  // queue
  if (path === '/queue' && method === 'GET') {
    const vd = url.searchParams.get('visit_date') || new Date().toISOString().slice(0, 10)
    const sesi = url.searchParams.get('sesi')
    let list = db.visits.filter((v: any) => v.visit_date === vd && (v.status === 'antre' || v.status === 'diperiksa'))
    if (sesi) list = list.filter((v: any) => v.sesi === sesi)
    const current = list.find((v: any) => v.status === 'diperiksa')
    const sedang = current ? { visit_id: current.id, queue_number: current.queue_number, patient: db.patients.find((p: any) => p.id === current.patient_id), service: current.service } : null
    const items = list.filter((v: any) => v.status === 'antre').map((v: any) => {
      const p = db.patients.find((x: any) => x.id === v.patient_id)
      return { visit_id: v.id, queue_number: v.queue_number, patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, service: v.service, status: v.status, keluhan: v.keluhan, estimasi_menit: 30 }
    })
    return json(res, 200, { visit_date: vd, sesi: sesi || 'pagi_siang', sedang_diperiksa: sedang, items })
  }

  // medical_record list
  if (path === '/medical_record' && method === 'GET') {
    const grouped: any = {}
    for (const [vid, r] of Object.entries(db.records)) {
      const v = db.visits.find((x: any) => x.id === vid)
      const p = db.patients.find((x: any) => x.id === v?.patient_id)
      if (!grouped[p.id]) grouped[p.id] = { patient: { id: p.id, no_rm: p.no_rm, nama_lengkap: p.nama_lengkap }, records: [] }
      grouped[p.id].records.push({ visit_id: vid, visit_date: v.visit_date, service: v.service, keluhan: v.keluhan, patient_note: r.patient_note, next_control_date: r.next_control_date })
    }
    return json(res, 200, paginate(Object.values(grouped), url.searchParams.get('limit') || 20, url.searchParams.get('offset') || 0))
  }
  const vrm = path.match(/^\/visits\/([^/]+)\/medical_record$/)
  if (vrm) {
    const vid = vrm[1]
    if (method === 'GET') {
      const r = db.records[vid]
      if (!r) return json(res, 404, { code: 'NOT_FOUND', message: 'Tidak ada' })
      if (user?.role === 'pasien') return json(res, 200, { visit_id: vid, patient_note: r.patient_note, next_control_date: r.next_control_date })
      return json(res, 200, r)
    }
    if (method === 'POST') {
      if (db.records[vid]) return json(res, 409, { code: 'RECORD_EXISTS', message: 'Sudah ada' })
      const v = db.visits.find((x: any) => x.id === vid)
      if (!v || v.status === 'batal' || v.status === 'antre') return json(res, 409, { code: 'VISIT_NOT_EXAMINABLE', message: 'Tidak bisa' })
      const b = await parseBody(req)
      const r = { visit_id: vid, subjective: b.subjective, objective: b.objective, assessment: b.assessment, plan: b.plan, service_details: b.service_details, patient_note: b.patient_note, next_control_date: b.next_control_date, examined_by: user.id, created_at: new Date().toISOString() }
      db.records[vid] = r
      return json(res, 201, r)
    }
  }

  // analytics/predict simple
  if (path === '/predict' && method === 'GET') {
    return json(res, 200, { generated_at: new Date().toISOString(), data: [] })
  }
  if (path === '/analytics/summary' && method === 'GET') {
    return json(res, 200, { periode: { dari: '2026-10-08', sampai: '2026-11-07' }, total_kunjungan: db.visits.length, selesai: db.visits.filter((v: any) => v.status === 'selesai').length, batal: db.visits.filter((v: any) => v.status === 'batal').length, pasien_unik: new Set(db.visits.map((v: any) => v.patient_id)).size, pasien_baru: 0, rata_kunjungan_per_hari: 4.0 })
  }
  if (path === '/analytics/trend' && method === 'GET') {
    return json(res, 200, { interval: url.searchParams.get('interval') || 'day', points: [] })
  }
  if (path === '/analytics/breakdown' && method === 'GET') {
    return json(res, 200, { per_layanan: [], per_sesi: [], per_hari_minggu: [] })
  }
  if (path === '/analytics/insight' && method === 'GET') {
    return json(res, 200, { periode: { dari: '2026-10-08', sampai: '2026-11-07' }, narasi: 'Mock insight', generated_at: new Date().toISOString(), dari_cache: true })
  }

  // users (admin) basic
  if (path === '/users') {
    if (method === 'GET') return json(res, 200, paginate(db.users.map(({ password, ...r }: any) => r), url.searchParams.get('limit') || 20, url.searchParams.get('offset') || 0))
    if (method === 'POST') {
      const b = await parseBody(req)
      const u = { id: uid(), username: b.username, nama_lengkap: b.nama_lengkap, nomor_wa: b.nomor_wa, role: b.role, password: b.password, created_at: new Date().toISOString() }
      db.users.push(u)
      const { password, ...r } = u
      return json(res, 201, r)
    }
  }
  const um = path.match(/^\/users\/([^/]+)$/)
  if (um && method === 'PATCH') {
    const u = db.users.find((x: any) => x.id === um[1])
    const b = await parseBody(req)
    Object.assign(u, b)
    const { password, ...r } = u
    return json(res, 200, r)
  }
  const urm = path.match(/^\/users\/([^/]+)\/reset-password$/)
  if (urm && method === 'POST') {
    const u = db.users.find((x: any) => x.id === urm[1])
    const b = await parseBody(req)
    u.password = b.password_baru
    return json(res, 200, { message: 'Password berhasil direset' })
  }

  return json(res, 404, { code: 'NOT_FOUND', message: 'Endpoint tidak ada' })
}