# Frontend (Vue 3 + Vite) — Elite Advisors

SPA de asesorías con autenticación, listado de planes y compra. Usa Pinia, Vue Router y Axios. Proxy de Vite envía `/api/*` al backend.

## Prerrequisitos
- Node.js 18+ y npm
- Backend corriendo en `http://localhost:4000`

## Instalación
```
cd client
npm install
```

## Desarrollo
```
npm run dev
```
- Front en `http://localhost:5173/`
- Proxy `/api` → `http://localhost:4000` (configurado en `vite.config.js`)

## Build y preview
```
npm run build
npm run preview
```
- Previsualización en `http://localhost:4173/` (por defecto)

## Rutas y vistas
- `/` Home
- `/login` Ingresar
- `/register` Registrarse
- `/memberships` Planes y compra
- `/dashboard` Estado de membresía y usuario

## Estado y API
- Pinia en `src/stores/auth.js` maneja `register`, `login`, `logout`, `fetchMe`
- Axios con `withCredentials=true` y `baseURL='/api'`

## Problemas comunes
- No carga `/me`: asegúrate que el backend devuelve cookie `httpOnly` y que el proxy está activo
- CORS: revisa `CLIENT_URL` en `server/.env`
- Puerto ocupado: ajusta `server` o `client/vite.config.js`

