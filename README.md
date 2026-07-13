# Activo App

Aplicación frontend construida con React + Vite.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env.local` en la raíz con la URL de tu backend:

```
VITE_API_BASE_URL=https://tu-backend.com/api
```

Si no se define, el cliente usa `/api` como base (útil con un proxy de desarrollo).

## Desarrollo

```bash
npm run dev
```

## Build de producción

```bash
npm run build
npm run preview
```

## Autenticación

El cliente de API está en `src/api/apiClient.js`. Expone métodos de autenticación
(`login`, `register`, `verifyOtp`, `resetPassword`, etc.) que esperan estas rutas
en tu backend (ajústalas según tu implementación):

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/verify-otp`
- `POST /auth/resend-otp`
- `POST /auth/reset-password-request`
- `POST /auth/reset-password`
- `GET /auth/me`
- `GET /auth/oauth/:provider` (OAuth, p. ej. Google)

El token se guarda en `localStorage` bajo la clave `access_token`.

---

## Proyecto unificado (activo + pino-codigos)

Este proyecto fusiona `activo_proy` y `pino-codigos` en una sola app Vite + React:

- **Base:** proyecto "activo" (Home, logins de Personas/Empresas, verificaciones y dashboards).
- **Añadido de "pino-codigos":**
  - `src/pages/Panel.jsx` (antes "Pino 3.jsx"): panel de solicitudes de permisos.
  - `src/components/panel/` (PanelHeader, ActionButtons, RequestRow).
  - Entidad `PinoPermiso` integrada en `src/api/apiClient.js` (`api.entities.PinoPermiso`).
  - `src/hooks/use-size.jsx`, `src/components/ui/image.jsx` y la carpeta `base44/` con los esquemas de entidades.
- Las páginas de auth de pino (Pino 1, 2, 4 y 5) eran duplicados de `ForgotPassword`, `Login`, `Register` y `ResetPassword` de activo, por lo que se usan estas últimas.

### Rutas

| Ruta | Página |
|---|---|
| `/` | Home |
| `/pino-pers`, `/pino-pers-veri`, `/pino-princi-per` | Flujo Personas |
| `/pino-empr`, `/pino-empr-veri`, `/pino-empre-princi` | Flujo Empresas |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth (de pino) |
| `/panel` | Panel de permisos (protegida, redirige a `/login`) |

### Backend

El cliente unificado (`src/api/apiClient.js`) usa `VITE_API_BASE_URL` (por defecto `/api`) y expone:
- `auth.*` — login, registro, OTP, reset de contraseña, OAuth.
- `api.entities.PinoPermiso` — list, get, create, update, delete, deleteMany y subscribe (polling).
