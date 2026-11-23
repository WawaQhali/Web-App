// Login del médico contra el backend (POST /v1/auth/login).
// La cuenta del médico es fija y la crea el backend al arrancar.
// Solo el médico entra a esta web: el backend ya no tiene otros roles (D39).
import { ApiError, request, setToken } from './api.js'

export async function login(usuario, contrasena) {
  const data = await request('/v1/auth/login', {
    method: 'POST',
    body: { usuario: usuario.trim(), contrasena },
  })
  if (data.rol !== 'medico') {
    throw new ApiError(403, 'sin_permiso', 'Esta web es solo para el médico.')
  }
  setToken(data.access_token)
  return { nombre: usuario.trim() }
}

export function logout() {
  setToken(null)
}
