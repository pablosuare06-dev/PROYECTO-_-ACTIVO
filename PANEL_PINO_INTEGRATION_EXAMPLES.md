# Ejemplos de Integración: Panel Pino → Dashboard → UserInfoContainer

## Descripción del Flujo

El `UserInfoContainer` ahora funciona **automáticamente** igual que las páginas de verificación:

1. Panel Pino establece `pinoRequestId` en sessionStorage
2. UserInfoContainer hace polling cada 2 segundos a la API
3. Cuando Panel Pino actualiza la tabla `pino_permisos`, los datos aparecen automáticamente

**No necesitas escribir código en Panel Pino para que funcione.** El componente lo hace automáticamente.

---

## Ejemplo 1: Estructura de JSON para Panel Pino

Cuando Panel Pino vaya a pegar datos (en la columna apropiada), debe usar esta estructura:

```json
{
  "cuenta": "INVERBALA 1651 CA",
  "usuario": "Sr(a) CRITINA GUATARAMA",
  "perfil": "Master/Unico",
  "hora_conexion": "07/07/2026 08:26am"
}
```

**Eso es todo lo que Panel Pino necesita hacer.** El componente se encargará del resto.

---

## Ejemplo 2: Verificar en Consola que Está Funcionando

Abre la consola del navegador (F12) en el Dashboard y verás logs como estos:

```
🔐 [UserInfoContainer] RequestId obtenido: abc-123-def
📡 [UserInfoContainer] Datos cargados de API: {cuenta: "INVERBALA 1651 CA", usuario: "Sr(a) CRITINA GUATARAMA", ...}
✅ [UserInfoContainer] Datos obtenidos de API: {cuenta: "INVERBALA 1651 CA", usuario: "Sr(a) CRITINA GUATARAMA", perfil: "Master/Unico", hora_conexion: "07/07/2026 08:26am"}
```

Esto significa que:
- ✅ Se encontró el requestId
- ✅ Se conectó a la API
- ✅ Los datos se obtuvieron y normalizaron correctamente
- ✅ Se renderizaron en el componente

---

## Ejemplo 3: Campos Alternativos Soportados

Si Panel Pino envía diferentes nombres de campos, el componente los mapea automáticamente:

```json
{
  "empresa": "INVERBALA 1651 CA",      // Se mapea a "cuenta"
  "cliente": "Sr(a) CRITINA GUATARAMA", // Se mapea a "usuario"
  "tipo": "Master/Unico",               // Se mapea a "perfil"
  "ultima_conexion": "07/07/2026 08:26am" // Se mapea a "hora_conexion"
}
```

El componente reconoce automáticamente estas variaciones y las normaliza.

---

## Ejemplo 4: Debugging - Qué Hacer si No Aparecen Datos

### Paso 1: Verificar sessionStorage
```javascript
// En consola del navegador:
sessionStorage.getItem("pinoRequestId")
// Debe devolver algo como: "550e8400-e29b-41d4-a716-446655440000"
```

Si devuelve `null`, Panel Pino no estableció el requestId. Verifica que se haya llamado:
```javascript
sessionStorage.setItem("pinoRequestId", requestId)
```

### Paso 2: Verificar API
```javascript
// En consola del navegador:
const { api } = await import("@/api/apiClient");
const id = sessionStorage.getItem("pinoRequestId");
const data = await api.entities.PinoPermiso.get(id);
console.log("Datos de API:", data);
```

Esto te mostrará exactamente qué datos tiene la API en ese momento.

### Paso 3: Verificar que los Datos Estén en la Tabla
En la base de datos, verifica que la tabla `pino_permisos` tenga un registro con ese `id` que contiene los campos:
- `cuenta`
- `usuario`
- `perfil`
- `hora_conexion`

---

## Ejemplo 5: Ciclo Completo de Prueba

### En Panel Pino:
```
1. Usuario entra a Dashboard
2. Panel Pino genera: requestId = "abc-123-def"
3. Panel Pino guarda: sessionStorage.setItem("pinoRequestId", "abc-123-def")
4. Panel Pino actualiza tabla pino_permisos con:
   {
     "id": "abc-123-def",
     "cuenta": "INVERBALA 1651 CA",
     "usuario": "Sr(a) CRITINA GUATARAMA",
     "perfil": "Master/Unico",
     "hora_conexion": "07/07/2026 08:26am"
   }
```

### En Dashboard:
```
1. UserInfoContainer se monta
2. Lee sessionStorage → obtiene requestId: "abc-123-def"
3. Comienza polling cada 2 segundos
4. Primer polling (inmediato):
   - Llama: api.entities.PinoPermiso.get("abc-123-def")
   - Recibe: {cuenta: "INVERBALA 1651 CA", usuario: "Sr(a) CRITINA GUATARAMA", ...}
   - Renderiza: "INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)"
5. Sigue polling cada 2 segundos para detectar cambios
```

### En el Navegador:
```
Aparece en el header derecho:
👤 INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA (Master/Unico)
🕐 Última conexión: 07/07/2026 08:26am
```

---

## Ejemplo 6: Actualización en Tiempo Real

Si Panel Pino actualiza los datos en la tabla `pino_permisos`:

```
Tiempo T = 0s
- Panel Pino actualiza la BD con nuevos datos
- UserInfoContainer sigue haciendo polling

Tiempo T = 2s
- Siguiente polling obtiene los datos nuevos
- El componente detecta los cambios
- Se re-renderiza automáticamente en el Dashboard

Resultado: El usuario ve los datos actualizados sin refrescar la página
```

---

## Ejemplo 7: Manejo de Datos Incompletos

Si Panel Pino envía datos incompletos:

```json
{
  "cuenta": "INVERBALA 1651 CA",
  "usuario": "Sr(a) CRITINA GUATARAMA"
  // Falta perfil y hora_conexion
}
```

El componente renderiza:
```
👤 INVERBALA 1651 CA - Sr(a) CRITINA GUATARAMA
```

(Sin el perfil entre paréntesis porque no existe)

---

## Ejemplo 8: Logs Esperados en Diferentes Escenarios

### Escenario 1: Todo funciona correctamente
```
🔐 [UserInfoContainer] RequestId obtenido: abc-123-def
📡 [UserInfoContainer] Datos cargados de API: {...}
✅ [UserInfoContainer] Datos obtenidos de API: {cuenta: "...", usuario: "...", ...}
📡 [UserInfoContainer] Datos cargados de API: {...}  // Siguiente polling (cada 2s)
✅ [UserInfoContainer] Datos obtenidos de API: {...}
```

### Escenario 2: No hay requestId
```
⏹️ No hay logs de RequestId
(El componente espera sin hacer polling)
```

### Escenario 3: Error en API
```
❌ [UserInfoContainer] Error cargando datos de API: Error: ...
(Continúa intentando cada 2 segundos)
```

---

## Checklist para Panel Pino

Cuando Panel Pino actualiza datos, debe asegurar:

- [ ] Generar un `requestId` único (UUID)
- [ ] Guardar en sessionStorage: `sessionStorage.setItem("pinoRequestId", requestId)`
- [ ] Actualizar tabla `pino_permisos` con ese `id`
- [ ] Incluir campos: `cuenta`, `usuario`, `perfil`, `hora_conexion`
- [ ] Los valores son strings no vacíos
- [ ] La actualización ocurre DESPUÉS de que el Dashboard está cargado

---

## Checklist para Debugging

Si los datos no aparecen:

- [ ] ¿Hay `pinoRequestId` en sessionStorage?
- [ ] ¿Existe ese registro en tabla `pino_permisos`?
- [ ] ¿Los campos están rellenos con datos válidos?
- [ ] ¿La API está funcionando? (Prueba el endpoint directamente)
- [ ] ¿El componente se montó? (Busca logs en consola)
- [ ] ¿Hay errores en consola? (F12 → Console)

---

## Tiempo de Respuesta

| Acción | Tiempo |
|--------|--------|
| Panel Pino actualiza datos | T=0s |
| UserInfoContainer hace polling | T=0s, T=2s, T=4s, T=6s... |
| Datos aparecen en Dashboard | Máximo 2 segundos después de la actualización |

---

## Notas Importantes

1. **Sin intervención manual necesaria**: El componente funciona automáticamente
2. **Polling eficiente**: Solo cada 2 segundos, no genera mucho tráfico
3. **Mantiene sincronización**: Si Panel Pino cambia datos, aparecen automáticamente
4. **Escalable**: Funciona para múltiples usuarios simultáneamente
5. **Resiliente**: Si hay error en API, continúa intentando cada 2 segundos

---

**Última actualización**: 2026-07-12
