// MOCK: checks the demo account stored in db.json.
// Replace with the real backend (e.g. Firebase Auth) when it exists.
import db from '../data/db.json'

export function login(email, password) {
  const { doctor } = db
  const ok =
    email.trim().toLowerCase() === doctor.email.toLowerCase() &&
    password === doctor.password
  if (!ok) return null
  return { name: doctor.name, cmp: doctor.cmp, email: doctor.email }
}
