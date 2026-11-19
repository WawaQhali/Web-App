// Cliente HTTP del backend de Wawa Qhali.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

let token = null
let onUnauthorized = () => {}

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

export function setToken(value) {
  token = value
}

export function setOnUnauthorized(callback) {
  onUnauthorized = callback
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'sin_conexion', 'No se pudo conectar con el servidor.')
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = data?.error ?? {}
    if (response.status === 401 && token) onUnauthorized()
    throw new ApiError(response.status, error.codigo ?? 'error', error.mensaje ?? 'Ocurrió un error.')
  }
  return data
}
