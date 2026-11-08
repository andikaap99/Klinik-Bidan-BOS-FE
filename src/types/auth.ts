export interface User {
  id: string
  username: string
  nama: string
  whatsapp: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  nama: string
  whatsapp: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
}
