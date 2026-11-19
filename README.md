# Wawa Qhali · Doctor review (web)

Web app where doctors review the photos that families donate from the Wawa Qhali mobile app and label them («Sí es urticaria» / «No es urticaria» / «La foto no sirve»), or delete them if they show identifying data. The labels go to the backend and are used to retrain the model.

Built with **Vue 3 + Vite**. It talks to the Wawa Qhali backend (`../wawa_qhali_backend`).

## Run it

Requires Node.js 18+ and the backend running (see the backend README).

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:8000
npm install
npm run dev
```

Open http://localhost:5173. The backend must allow that origin in `CORS_ORIGINS`.

**Doctor account (fixed, created by the backend on startup):**
- User: `medico`
- Password: `WawaQhali-Medico-2026`

To have cases to review locally, run `uv run python -m scripts.sembrar_demo` in the backend first.

## How it maps to the backend

| Screen action | Backend |
| --- | --- |
| Login | `POST /v1/auth/login` → JWT valid for 1 hour (back to login when it expires) |
| Pending cases | `GET /v1/revision/pendientes` |
| Case detail and photo | `GET /v1/revision/{id}` (the photo link expires in 5 minutes) |
| Sí / No / La foto no sirve | `POST /v1/revision/{id}/etiqueta` with `compatible` / `no_compatible` / `no_evaluable` |
| Deshacer | Goes back to the case; deciding again overwrites the label |
| Eliminar imagen | `POST /v1/revision/{id}/eliminar` |

The questionnaire texts come from `src/data/preguntas.json`, an exact copy of the backend's `app/modules/orientacion/preguntas.json`. If one changes, update both.

## Structure

```
src/services/api.js          HTTP client (token, errors, 401 → back to login)
src/services/auth.js         Login against the backend
src/services/cases.js        Pending cases, detail, labels, delete
src/data/preguntas.json      Questionnaire v1 (copy of the backend's)
src/views/LoginView.vue      Doctor login
src/views/ReviewView.vue     Case review, undo, delete and "no pending cases"
src/components/LesionImage.vue  Donated photo from the temporary link
```
