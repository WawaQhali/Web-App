# Wawa Qhali · Doctor review (web)

Web app where authorized doctors review the photos that families donate from the
Wawa Qhali mobile app and label them («Sí es urticaria» / «No es urticaria» /
«La foto no sirve»). The labels are used to retrain the model.

Built with **Vue 3 + Vite**. Frontend only: login, cases and labels are mocked.

## Run it

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

Demo account (in `src/data/db.json`):

- Email: `medico@wawaqhali.pe`
- Password: `demo1234`

## Structure

```
src/data/db.json              Demo doctor, symptom questions and donated cases.
src/services/auth.js          MOCK · login against db.json.
src/services/cases.js         MOCK · donated cases + labels/helpers.
src/views/LoginView.vue       Doctor login.
src/views/ReviewView.vue      Case review, undo and "no pending cases" screen.
src/components/AppLogo.vue    Logo.
src/components/LesionImage.vue  Donated photo (placeholder drawing while image is null).
src/styles.css                Palette and shared styles (same as the mobile app).
```

## Pending (outside this base)

- Real authentication (e.g. Firebase Auth).
- Real donated cases and photos (set `image` to the photo URL in each case).
- Save labels to the training dataset instead of keeping them in memory.
