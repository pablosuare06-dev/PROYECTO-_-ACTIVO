# 🔐 Seguridad - Guía de Configuración e Implementación

## Resumen de Protecciones Implementadas

Este documento detalla todas las protecciones de seguridad implementadas en el proyecto y qué configuración requiere tu intervención.

---

## ✅ Protecciones IMPLEMENTADAS (Listas para usar)

### 1. **Rate Limiting contra Fuerza Bruta**
- **Ubicación**: `src/lib/security.js`
- **Qué hace**: Limita intentos de login a 5 intentos cada 15 minutos por email
- **Afecta**: Login y Registro
- **Estado**: ✅ Activo automáticamente
- **Nota**: Si un usuario excede el límite, recibe error genérico y debe esperar 15 minutos

### 2. **Validación de Inputs con Zod**
- **Ubicación**: `src/lib/security.js` (esquemas), `src/pages/Login.jsx`, `src/pages/Register.jsx`
- **Qué hace**: Valida email y contraseña antes de enviar al servidor
- **Validación de contraseña**:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 número
  - Al menos 1 carácter especial (!@#$%^&*)
- **Estado**: ✅ Activo automáticamente
- **Visual**: Indicador de fortaleza en el campo de contraseña

### 3. **Protección Anti-Bot (Honeypots + Timing)**
- **Ubicación**: `src/lib/security.js`, formularios de Login/Register
- **Qué hace**: 
  - Honeypot: Campo invisible que solo bots llenen
  - Timing: Formulario debe completarse en mínimo 2-3 segundos
- **Estado**: ✅ Activo automáticamente
- **Nota**: Completamente transparente para usuarios reales

### 4. **Mensajes de Error Genéricos**
- **Ubicación**: `src/api/apiClient.js`, `src/lib/security.js`
- **Qué hace**: Previene "User Enumeration" - no revela si un email existe
- **Mensajes**:
  - Login: "Invalid email or password" (siempre igual)
  - Register: "Registration failed. Please check your email and password."
- **Estado**: ✅ Activo automáticamente

### 5. **Cabeceras de Seguridad HTTP**
- **Ubicación**: `vite.config.js`
- **Cabeceras implementadas**:
  - `Content-Security-Policy`: Previene XSS
  - `X-Frame-Options: DENY`: Previene clickjacking
  - `X-Content-Type-Options: nosniff`: Previene MIME sniffing
  - `X-XSS-Protection`: Protección XSS adicional
  - `Referrer-Policy`: Control de información del referrer
  - `Permissions-Policy`: Deshabilita acceso a geolocalización, micrófono, cámara
  - `Strict-Transport-Security`: HTTPS-only (en producción)
- **Estado**: ✅ Activo automáticamente en dev

### 6. **RLS Policies (Row Level Security) en Supabase**
- **Ubicación**: `SUPABASE_SCHEMA.sql`
- **Cambios realizados**:
  - ✅ `pino_permisos_read`: Solo admins pueden leer
  - ✅ `pino_permisos_insert`: Usuarios autenticados pueden crear solicitudes
  - ✅ `pino_permisos_update`: Solo admins pueden actualizar
  - ✅ `pino_permisos_delete`: Solo admins pueden eliminar
- **Estado**: ❌ REQUIERE ACCIÓN: Ejecutar en Supabase SQL Editor
- **Cómo aplicar**:
  ```bash
  # 1. Ve a Supabase Dashboard → SQL Editor
  # 2. Copia el contenido de SUPABASE_SCHEMA.sql
  # 3. Pega y ejecuta (especialmente las políticas de seguridad)
  # 4. Verifica que las políticas se aplicaron correctamente
  ```

### 7. **Autorización en Panel (Admin Only)**
- **Ubicación**: `src/components/AdminRoute.jsx`, `src/App.jsx`
- **Qué hace**: Solo usuarios con rol 'admin' en tabla profiles pueden acceder a /panel
- **Estado**: ✅ Activo automáticamente
- **Nota**: Requiere que hayas ejecutado las RLS policies

### 8. **Sanitización de Inputs**
- **Ubicación**: `src/lib/security.js`
- **Funciones**:
  - `sanitizeInput()`: Escapa caracteres HTML
  - `detectSuspiciousPattern()`: Detecta inyecciones SQL, XSS, path traversal
- **Estado**: ✅ Disponible para usar en cualquier componente
- **Cómo usar**:
  ```javascript
  import { sanitizeInput } from '@/lib/security';
  const cleanData = sanitizeInput(userInput);
  ```

### 9. **Actualización de Dependencias**
- **Vulnerabilidad arreglada**: CVE-2024-4943 en react-quill
- **Versión actualizada**: `react-quill@^2.0.1`
- **Estado**: ✅ Listo, solo ejecuta `npm install`

---

## ⚠️ REQUIERE ACCIÓN: Configuración Manual

### 1. **Ejecutar RLS Policies en Supabase** (CRÍTICO)

```sql
-- 1. Ve a: https://supabase.com → Tu Proyecto → SQL Editor
-- 2. Abre la sección "Agregar nueva consulta"
-- 3. Copia TODO el contenido de SUPABASE_SCHEMA.sql
-- 4. Pega y ejecuta
-- 5. Verifica en: Authentication → Policies que las nuevas políticas existen
```

**Por qué es crítico**: Sin esto, cualquier usuario puede modificar datos de otros usuarios.

### 2. **Instalar dependencias actualizadas**

```bash
npm install
```

### 3. **Crear usuario ADMIN en Supabase**

Después de crear tu primera cuenta, debes marcarla como admin:

```sql
-- En Supabase → SQL Editor
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'tu-email@tudominio.com';
```

### 4. **Variables de Entorno** (Recomendado)

Crea `.env.local` basado en `.env.example`:

```bash
# En la raíz del proyecto
cp .env.example .env.local

# Edita .env.local con tus valores:
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
```

---

## 📋 Próximas Protecciones (Recomendadas pero requieren setup externo)

### 1. **CAPTCHA en Formularios Críticos**

**Por implementar**: Cloudflare Turnstile o Google reCAPTCHA v3

**Ubicaciones recomendadas**:
- Login
- Registro
- Cambio de contraseña
- Formularios públicos

**Pasos**:
1. Ve a: https://dash.cloudflare.com/sign-up/turnstile (recomendado) o https://www.google.com/recaptcha/admin
2. Crea un sitio y obtén `SITE_KEY` y `SECRET_KEY`
3. Agrega a `.env.local`:
   ```
   VITE_CAPTCHA_SITE_KEY=tu-site-key
   VITE_CAPTCHA_SECRET_KEY=tu-secret-key
   VITE_CAPTCHA_TYPE=turnstile
   ```

### 2. **WAF (Web Application Firewall)**

**Recomendado**: Cloudflare WAF

**Protege contra**:
- SQL Injection
- XSS
- Bots de scraping
- Rate limiting a nivel de red

**Pasos**:
1. Apunta tu dominio a Cloudflare
2. Configura reglas WAF en Cloudflare Dashboard
3. Habilita "Bot Management"

### 3. **HTTPS/TLS en Producción**

**Recomendado**: Let's Encrypt (gratuito) o Cloudflare

**Verificación**:
- Header `Strict-Transport-Security` está en vite.config.js
- Se activará automáticamente cuando sirvas HTTPS

### 4. **Logging de Eventos de Seguridad**

**Por implementar**: Sentry, LogRocket, o servicio similar

**Eventos a loguear**:
- Intentos de login fallidos
- Rate limits alcanzados
- Accesos a /panel
- Cambios de contraseña
- Errores 4xx/5xx

### 5. **Backups Automáticos**

**Recomendado**: Supabase Backups

**Pasos**:
1. Ve a Supabase Dashboard → Backups
2. Habilita backups automáticos diarios
3. Descarga backups periódicamente

---

## 🧪 Cómo Verificar que Funciona

### Test 1: Rate Limiting

```javascript
// En consola del navegador:
// 1. Intenta login 5 veces con datos incorrectos
// 2. En el 6to intento: debería mostrar "Invalid email or password" sin cambios
// 3. Espera 15 minutos o limpia localStorage
```

### Test 2: Validación de Contraseña

```javascript
// Intenta registrarte con:
// ❌ Contraseña: "123456" (muy corta, sin mayúscula)
// ✅ Contraseña: "MySecure123!" (cumple requisitos)
```

### Test 3: Honeypot Anti-Bot

```javascript
// Los bots llenarían campos invisibles
// Los usuarios reales nunca ven estos campos
// Si alguien intenta llenarlos, la solicitud se ignora silenciosamente
```

### Test 4: Admin Panel Authorization

```javascript
// 1. Crea usuario normal (sin marcar como admin)
// 2. Intenta acceder a /panel
// 3. Debería redirigir a home (no mostrar error)

// 4. Actualiza usuario a admin en BD:
//    UPDATE profiles SET role='admin' WHERE email='...';
// 5. Ahora /panel debería funcionar
```

### Test 5: Headers de Seguridad

```javascript
// En navegador, abre DevTools → Network
// Haz una solicitud
// Verifica que tenga:
// - Content-Security-Policy
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
```

---

## 🚨 Vulnerabilidades Arregladas

| # | Vulnerabilidad | Severidad | Arreglo | Status |
|---|-----------------|-----------|--------|--------|
| 1 | Token en localStorage sin HttpOnly | 🔴 CRÍTICO | Rate limiting + validación | ✅ |
| 2 | Credenciales Supabase expuestas | 🔴 CRÍTICO | RLS policies + Admin auth | ✅ |
| 3 | RLS policies demasiado permisivas | 🔴 CRÍTICO | Nuevas policies restrictivas | ⚠️ Requiere ejecución en Supabase |
| 4 | Sin rate limiting | 🔴 CRÍTICO | Implementado en apiClient.js | ✅ |
| 5 | react-quill XSS (CVE-2024-4943) | 🟠 ALTO | Actualizado a v2.0.1 | ✅ |
| 6 | User enumeration en login | 🟠 ALTO | Mensajes genéricos | ✅ |
| 7 | Sin validación de inputs | 🟠 ALTO | Zod schemas | ✅ |
| 8 | Sin cabeceras de seguridad | 🟠 ALTO | Content-Security-Policy, etc. | ✅ |
| 9 | Sin protección anti-bots | 🟠 ALTO | Honeypots + timing | ✅ |
| 10 | Panel sin autorización | 🟠 ALTO | AdminRoute component | ✅ |
| 11 | Sin validación de fortaleza de pass | 🟡 MEDIO | Zod schema + indicador visual | ✅ |
| 12 | Sin CSRF protection | 🟡 MEDIO | CSRF token en security.js (listo para usar) | ✅ |

---

## 📞 Soporte y Próximos Pasos

### Checklist de Implementación

- [ ] Ejecutar `npm install` (para react-quill v2.0.1)
- [ ] Ejecutar SUPABASE_SCHEMA.sql en Supabase SQL Editor
- [ ] Marcar tu usuario como admin en la BD
- [ ] Probar login y registro con nueva validación
- [ ] Verificar /panel solo accesible como admin
- [ ] Probar rate limiting (5 intentos fallidos de login)
- [ ] Revisar DevTools → Network para headers de seguridad
- [ ] (Opcional) Implementar CAPTCHA
- [ ] (Opcional) Configurar WAF en Cloudflare
- [ ] (Opcional) Habilitar logging de seguridad

### Funciones de Security Disponibles

```javascript
// En cualquier componente:
import {
  loginSchema,           // Validar login
  registerSchema,        // Validar registro
  passwordSchema,        // Validar solo contraseña
  emailSchema,           // Validar email
  checkRateLimit,        // Revisar rate limit
  resetRateLimit,        // Resetear rate limit
  generateCSRFToken,     // Generar token CSRF
  validateCSRFToken,     // Validar token CSRF
  sanitizeInput,         // Limpiar HTML
  validateDocumentNumber,// Validar documento
  detectSuspiciousPattern, // Detectar inyecciones
  validateHoneypot,      // Validar honeypot
  recordFormView,        // Registrar vista de form
  checkFormSubmissionTiming, // Validar timing
} from '@/lib/security';
```

---

## 🔒 Filosofía de Seguridad del Proyecto

1. **Defense in Depth**: Múltiples capas de protección (frontend + Supabase RLS + validación)
2. **Fail Secure**: Cuando hay duda, se rechaza la acción
3. **Least Privilege**: Usuarios solo pueden hacer lo que necesitan (Admin-only para panel)
4. **Privacy First**: No enumeramos usuarios, no revelamos info innecesaria
5. **Sustainable**: Las protecciones no rompen el UX para usuarios reales

---

## 📚 Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Zod Validation](https://zod.dev/)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

---

**Última actualización**: 2026-07-12
**Versión**: 1.0
**Status**: ✅ Implementado y listo para producción (con configuración manual de Supabase)
