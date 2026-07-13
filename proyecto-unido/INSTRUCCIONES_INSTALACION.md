# ✅ Instalación y Configuración - Proyecto Unido + Supabase

## 🔧 Paso 1: Actualizar la base de datos en Supabase

**Tienes DOS opciones:**

### Opción A: Ya tienes Supabase creado
1. Ve a [Supabase Console](https://app.supabase.com)
2. Abre tu proyecto
3. Ve a **SQL Editor** → **New Query**
4. Copia TODO el contenido de `SUPABASE_SCHEMA.sql`
5. Pega en el editor
6. Haz clic en **Run** (botón verde)
7. ✓ Listo (verás "Success")

### Opción B: Aún no tienes Supabase
1. Ve a [supabase.com](https://supabase.com) → Sign Up
2. Crea un nuevo proyecto
3. Nombre: `proyecto-unido` (o el que prefieras)
4. Espera 2-3 minutos a que se inicialice
5. Luego sigue los pasos de **Opción A**

---

## 🔐 Paso 2: Configurar autenticación (Email + OTP)

1. Ve a **Authentication → Providers**
2. Busca **Email**
   - ✓ Enable Email provider
   - ✓ Confirm email enabled (esto envía OTP)
   - **Confirm Redirect URL**: `http://localhost:5173/auth/callback` (desarrollo)
3. Guarda cambios

### (Opcional) Google OAuth
1. Ve a **Authentication → Providers → Google**
2. Habilita Google
3. Necesitas credenciales de Google Cloud Console:
   - Ve a [Google Cloud Console](https://console.cloud.google.com)
   - Crea un proyecto
   - Ve a **Credentials** → **OAuth 2.0 Client ID** (create one)
   - Application type: **Web application**
   - Authorized redirect URIs: `https://xxxxx.supabase.co/auth/v1/callback` (copia de Supabase)
   - Copia Client ID y Secret a Supabase

---

## 🔑 Paso 3: Obtener credenciales

1. En Supabase: **Settings → API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJI...` (la larga)

---

## 📝 Paso 4: Configurar `.env.local`

En la raíz del proyecto (`proyecto-unido/.env.local`):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

Reemplaza `xxxxx` y `eyJhbGciOiJI...` con tus valores reales.

⚠️ **NUNCA** hagas commit de `.env.local` — está en `.gitignore`

---

## 🚀 Paso 5: Correr la app

```bash
# En la carpeta proyecto-unido
npm install   # Si no lo hiciste aún
npm run dev
```

Abre: **http://localhost:5173**

---

## 🎯 Flujo de trabajo

### Usuario registra solicitud
1. Va a `/register`
2. Entra email + password
3. Supabase envía OTP por email
4. Usuario entra código OTP
5. ✓ Usuario autenticado, se redirige a `/`

### Admin revisa y aprueba
1. Va a `/panel` (solo usuarios autenticados)
2. Ve tabla con solicitudes
3. Botones: **✓ Aprobar** o **✗ Rechazar**
4. Si rechaza, ingresa razón
5. Estado se actualiza automáticamente

### Usuario verifica estado
1. Va a `/verify-solicitud`
2. Entra su número de documento
3. Ve: ⏳ Pendiente / ✓ Aprobado / ✗ Rechazado
4. Si rechazado, ve la razón

---

## 📊 Tabla: pino_permisos

Campos automáticos:
- `id` (UUID)
- `created_at` (cuando se creó)
- `updated_at` (última modificación)

Campos a llenar:
- `numero_documento` (requerido)
- `usuario` (requerido)
- `imagen` (opcional)
- `clave` (opcional)
- `token` (opcional)

Campos de aprobación:
- `status`: pendiente → aprobado → rechazado
- `razon_rechazo`: razón del rechazo (si aplica)
- `aprobado_en`: timestamp cuando se aprobó/rechazó

---

## 🛡️ Seguridad (RLS)

Las tablas tienen Row Level Security (RLS) habilitado:

- **profiles**: cada usuario ve solo su propio perfil
- **pino_permisos**: usuarios autenticados pueden ver/editar/eliminar (ajustable en Supabase)

Si necesitas más restricciones (p. ej., solo admin puede aprobar), edita las políticas en:
**Authentication → Policies → pino_permisos**

---

## ✅ Checklist Final

- [ ] Supabase proyecto creado
- [ ] SQL ejecutado (tablas creadas)
- [ ] Auth (Email) habilitada
- [ ] `.env.local` configurado
- [ ] `npm install` ejecutado
- [ ] `npm run dev` corriendo
- [ ] Puedes registrarte en `/register`
- [ ] Recibes OTP por email
- [ ] Puedes ver `/panel`
- [ ] Puedes verificar status en `/verify-solicitud`

---

## 🆘 Troubleshooting

### "Supabase credentials missing"
- Abre `.env.local`
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén completos
- Reinicia: `npm run dev`

### OTP no llega por email
- En Supabase: **Authentication → Users** — busca el usuario
- Verifica que el email esté confirmado
- En **Logs** (abajo a la izquierda) ves si hay errores de SMTP
- Por defecto, Supabase usa su propio servicio de email

### Panel está vacío
- Asegúrate de estar autenticado (debería haber un `/panel` protegido)
- Registra una solicitud primero en `/register`
- La solicitud debe tener `numero_documento` y `usuario`

### Botones de Aprobar/Rechazar no aparecen
- Solo aparecen si el status es `pendiente`
- Verifica en Supabase que la fila tenga `status = 'pendiente'`

---

## 📚 Rutas principales

| URL | Descripción |
|---|---|
| `/` | Home |
| `/register` | Registro con OTP |
| `/login` | Login email/password |
| `/verify-solicitud` | Verificar estado de solicitud |
| `/panel` | Panel admin (protegido) |
| `/forgot-password` | Recuperar contraseña |

---

¡Listo! Tu app está conectada con Supabase. 🎉
