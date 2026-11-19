// Login del médico contra el backend (POST /v1/auth/login).
// La cuenta del médico es fija y la crea el backend al arrancar.
import { request, setToken } from './api.js'

export async function login(usuario, contrasena) {
  const data = await request('/v1/auth/login', {
    method: 'POST',
    body: { usuario: usuario.trim(), contrasena },
  })
  setToken(data.access_token)
  return { usuario: usuario.trim(), rol: data.rol }
}

export function logout() {
  setToken(null)
}
