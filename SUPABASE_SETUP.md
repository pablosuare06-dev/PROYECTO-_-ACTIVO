# Configuración de Supabase

Este proyecto ya está integrado con Supabase. Sigue estos pasos para completar la configuración:

## 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Project name**: `proyecto-unido` (o el que prefieras)
   - **Database password**: guarda una contraseña segura
   - **Region**: elige la más cercana a ti
3. Espera a que se inicialice (2-3 minutos)

## 2. Ejecutar el SQL de base de datos

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query y pega todo el SQL de [SUPABASE_SCHEMA.sql](./SUPABASE_SCHEMA.sql)
3. Haz clic en **Run**

Esto creará:
- Tabla `pino_permisos` (con índices y triggers)
- Tabla `profiles` (rol de usuario)
- Funciones y triggers automáticos para gestionar usuarios

## 3. Configurar Supabase Auth

1. Ve a **Authentication → Providers**
2. Habilita **Email**:
   - ✓ Enable Email provider
   - Confirm email: OFF (permite que los usuarios se verifiquen con OTP)
3. Habilita **Google OAuth** (opcional, pero recomendado):
   - Ve a Google Cloud Console
   - Crea credenciales OAuth 2.0
   - Copia Client ID y Client Secret a Supabase

## 4. Obtener credenciales

1. Ve a **Settings → API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGc...` (la clave pública)

## 5. Configurar el frontend

1. Abre `.env.local` en la raíz del proyecto
2. Reemplaza los valores:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. **NO commits `.env.local`** — está en `.gitignore`

## 6. Ejecutar la app

```bash
npm install
npm run dev
```

La app estará en `http://localhost:5173`

---

## Flujo de autenticación

### Registro con OTP
1. Usuario entra email y password en Register
2. `auth.register()` crea el usuario (Supabase envía OTP automáticamente)
3. Usuario recibe código en email
4. Usuario entra el código en la pantalla de OTP
5. `auth.verifyOtp()` valida y crea sesión

### Login
1. Usuario entra email y password
2. `auth.loginViaEmailPassword()` autentica
3. Token se guarda en localStorage y sesión de Supabase

### OAuth (Google)
1. Click en "Continue with Google"
2. Redirecciona a Google
3. Google redirige a `/auth/callback` con token
4. Usuario autenticado

### Reset de contraseña
1. Click en "Forgot password"
2. `auth.resetPasswordRequest(email)` envía email
3. Usuario click en link del email
4. Entra nueva contraseña en `/reset-password`
5. `auth.resetPassword()` actualiza la contraseña

---

## Tabla: pino_permisos

Estructura:
```sql
id              UUID (auto-generado)
numero_documento TEXT (requerido)
usuario         TEXT (requerido)
imagen          TEXT (URL de imagen)
clave           TEXT
token           TEXT
created_at      TIMESTAMPTZ (auto)
updated_at      TIMESTAMPTZ (auto)
```

### Operaciones

```javascript
import { api } from '@/api/apiClient';

// Listar permisos (últimos primero, máx 50)
const permisos = await api.entities.PinoPermiso.list('-created_at', 50);

// Obtener uno
const permiso = await api.entities.PinoPermiso.get(id);

// Crear
const nuevo = await api.entities.PinoPermiso.create({
  numero_documento: '12345678',
  usuario: 'John Doe',
  imagen: 'https://...',
  clave: 'SECRET123',
});

// Actualizar
const actualizado = await api.entities.PinoPermiso.update(id, {
  clave: 'NEW_SECRET',
});

// Eliminar uno
await api.entities.PinoPermiso.delete(id);

// Eliminar todos
await api.entities.PinoPermiso.deleteMany({});

// Suscribirse a cambios (polling cada 10s)
const unsubscribe = api.entities.PinoPermiso.subscribe(() => {
  console.log('Data actualizado');
});
```

---

## Row Level Security (RLS)

Las políticas de seguridad están habilitadas:
- `profiles`: cada usuario ve/edita solo su propio perfil
- `pino_permisos`: todos los usuarios autenticados pueden operar (CRUD)

Si necesitas políticas más restrictivas, edita las reglas en **Authentication → Policies**.

---

## Troubleshooting

### "Supabase credentials missing"
- Verifica que `.env.local` tenga `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Reinicia el servidor (`npm run dev`)

### "Invalid login credentials"
- Asegúrate de que el usuario existe en Supabase
- Verifica email y password
- Si el usuario no está verificado (OTP pendiente), no puede login

### OTP no se recibe
- Verifica email en **Authentication → Logs** (si hay errores de envío)
- Asegúrate de que Supabase Auth tiene configurado SMTP o usa su servicio por defecto
- El OTP es válido por 15 minutos

### Google OAuth no funciona
- Verifica que las credenciales de Google estén correctamente configuradas en Supabase
- El redirect URI debe ser `https://xxxxx.supabase.co/auth/v1/callback`

---

## Próximos pasos

- Configura CORS en Supabase si tu frontend está en otro dominio
- Activa Webhook si quieres disparar acciones en cambios de datos
- Configura realtime (websockets) si necesitas datos en vivo
- Integra Storage para archivos/imágenes si `imagen` será un file_url real
