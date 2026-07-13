# Guía de Integración: UserInfoContainer - Carga Dinámica de Datos

## Descripción General

El componente `UserInfoContainer` ahora funciona **igual que las páginas de `EmpresasVerification` y `PersonasVerification`**:

1. **Lee `requestId` de `sessionStorage`** (establecido automáticamente por Panel Pino)
2. **Hace polling a la API cada 2 segundos** para obtener datos de la tabla `pino_permisos`
3. **Renderiza información de usuario y última conexión** de forma completamente dinámica

El componente busca automáticamente los datos sin necesidad de intervención manual. Simplemente pega el JSON en el Panel Pino con la columna "imagen" (como en las páginas de verificación) y los datos aparecerán en el Dashboard.

## Estructura de Datos JSON

Los datos pegados en el Panel Pino (columna "imagen" o en el campo apropiado) deben tener esta estructura:

```json
{
  "cuenta": "INVERBALA 1651 CA",
  "usuario": "Sr(a) CRITINA GUATARAMA",
  "perfil": "Master/Unico",
  "hora_conexion": "07/07/2026 08:26am"
}
```

### Campos de Datos:

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `cuenta` | string | ✅ | Identificador de la cuenta | "INVERBALA 1651 CA" |
| `usuario` | string | ✅ | Nombre del usuario | "Sr(a) CRITINA GUATARAMA" |
| `perfil` | string | ✅ | Tipo de perfil del usuario | "Master/Unico" |
| `hora_conexion` | string | ✅ | Timestamp de última conexión | "07/07/2026 08:26am" |

## Formato de Salida Visual

El componente renderiza automáticamente en este formato:

```
👤 INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)
🕐 Última conexión: 07/07/2026 08:26am
```

### Primer div (Información de Usuario):
- Formato: `{cuenta} - {usuario} ({perfil})`
- Icono: 👤 (Usuario)
- Tamaño de fuente: 11px
- Color: rgb(51, 51, 51)

### Segundo div (Última Conexión):
- Formato: `Última conexión: {hora_conexion}`
- Icono: 🕐 (Reloj)
- Tamaño de fuente: 10px
- Color: rgb(102, 102, 102)

## Flujo de Funcionamiento

### Paso 1: Panel Pino obtiene el requestId
Cuando el usuario entra a Dashboard, Panel Pino genera un `requestId` y lo guarda en:
```javascript
sessionStorage.setItem("pinoRequestId", requestId)
```

### Paso 2: UserInfoContainer detecta el requestId
Al montarse, el componente busca automáticamente:
```javascript
const requestId = sessionStorage.getItem("pinoRequestId");
```

### Paso 3: Polling cada 2 segundos
El componente hace una consulta a la API cada 2 segundos:
```javascript
const request = await api.entities.PinoPermiso.get(requestId);
```

### Paso 4: Renderiza datos automáticamente
Cuando Panel Pino pega los datos en la tabla `pino_permisos`, el siguiente polling (máximo en 2 segundos) los obtiene y los renderiza en el Dashboard.

## Ubicación en el Proyecto

- **Componente**: `src/components/UserInfoContainer.tsx`
- **Se renderiza en**: `src/pages/DashboardEmpresas.jsx` (línea 129)
- **Ubicación visual**: Header derecho del Dashboard, junto al botón "Salir"

## Cómo Usar desde Panel Pino

### 1. Panel Pino pega JSON con estructura especificada
Panel Pino actualiza la tabla `pino_permisos` con los datos del usuario.

### 2. UserInfoContainer detecta cambios automáticamente
Cada 2 segundos, el componente consulta la API y obtiene los datos actualizados.

### 3. Los datos aparecen en el Dashboard
Automáticamente se renderiza la información sin necesidad de refrescar la página.

## Características Clave

✅ **Polling automático cada 2 segundos** - Sin necesidad de refrescar
✅ **Información completamente dinámica** - Se actualiza en tiempo real
✅ **Estilos intactos** - SVGs y colores se mantienen exactos
✅ **Normalización de campos** - Acepta variaciones en nombres de campos
✅ **Sincronización Realtime** - Opcional: también escucha cambios desde Supabase
✅ **Estados de carga** - Muestra skeleton loaders mientras carga
✅ **Manejo de errores** - Gracefully maneja datos incompletos

## Normalización de Campos

El componente acepta campos alternativos además de los principales:

| Campo Principal | Alternativas |
|-----------------|--------------|
| `cuenta` | `empresa` |
| `usuario` | `cliente` |
| `perfil` | `tipo` |
| `hora_conexion` | `ultima_conexion` |

Esto significa que Panel Pino puede enviar cualquiera de estas variaciones y el componente lo procesará correctamente.

## Logs de Debug

El componente incluye logs detallados en la consola del navegador. Abre la consola (F12) para ver:

```
🔐 [UserInfoContainer] RequestId obtenido: <id>
📡 [UserInfoContainer] Datos cargados de API: {...}
✅ [UserInfoContainer] Datos obtenidos de API: {...}
```

## Requisitos

1. **sessionStorage.pinoRequestId** debe estar establecido antes de que se monte el componente
2. **API disponible**: `api.entities.PinoPermiso.get(requestId)` debe funcionar
3. **Datos en tabla pino_permisos**: Los campos `cuenta`, `usuario`, `perfil`, `hora_conexion` deben existir en la tabla

## Ejemplo de Flujo Completo

1. **Usuario entra a Dashboard**
   - Panel Pino genera requestId y lo guarda en sessionStorage

2. **Dashboard se renderiza**
   - UserInfoContainer se monta
   - Detecta requestId en sessionStorage
   - Comienza polling cada 2 segundos

3. **Panel Pino pega JSON**
   - Panel Pino actualiza tabla `pino_permisos` con los datos

4. **Datos aparecen en Dashboard**
   - En el siguiente polling (máximo 2 segundos), se obtienen los datos
   - UserInfoContainer renderiza: "INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)"

## Estados del Componente

### Estado: Cargando
```
👤 [skeleton loader]
🕐 [skeleton loader]
```
Muestra mientras se obtienen los datos de la API por primera vez.

### Estado: Datos cargados
```
👤 INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)
🕐 Última conexión: 07/07/2026 08:26am
```
Datos renderizados correctamente.

### Estado: Sin datos
```
👤 Cargando información...
```
Cuando no hay requestId en sessionStorage.

## Validación de Datos

El componente valida automáticamente:
- ✅ Normaliza campos alternativos
- ✅ Elimina espacios en blanco innecesarios
- ✅ Requiere al menos `cuenta` o `usuario`
- ✅ Acepta campos opcionales vacíos
- ✅ Maneja errores de API gracefully

## Performance

- **Polling interval**: 2 segundos (igual a Verification pages)
- **Actualización**: Solo re-renderiza cuando hay datos nuevos
- **Memoria**: Usa refs para evitar re-renders innecesarios
- **API calls**: Mínimas gracias al polling controlado

---

**Última actualización**: 2026-07-12
**Componente**: UserInfoContainer.tsx v2.1
**Patrón**: Polling cada 2 segundos desde API (igual a EmpresasVerification)
