# Guía de Carga Dinámica de Datos del Usuario

## 📋 Descripción
Sistema para cargar dinámicamente información del usuario en las páginas **"Pino empre princi" (DashboardEmpresas)** y **"Sección Personas" (DashboardPersonas)**.

## 🎯 Páginas Afectadas
- ✅ `src/pages/DashboardEmpresas.jsx` - Página de Empresas
- ✅ `src/pages/DashboardPersonas.jsx` - Página de Personas
- ❌ Resto de páginas - No se ven afectadas

## 🔧 Componentes Creados

### 1. `UserInfoContainer.jsx`
Componente React reutilizable que:
- Muestra skeleton loader mientras carga
- Renderiza datos dinámicamente
- Oculta campos vacíos sin dejar huecos
- Expone función global `window.cargarDatosContenedor()`

### 2. `userDataLoader.js`
Utilidad para facilitar la carga de datos desde cualquier lugar.

## 📊 Formato de Datos

```javascript
{
  "cuenta": "INVERBALA 1651 CA",           // Nombre de la empresa o cuenta
  "usuario": "Sr(a) CRISTINA GUATARAMA",   // Nombre del usuario
  "perfil": "Master/Único",                // Perfil/rol (opcional)
  "hora_conexion": "11/07/2026 01:36pm"    // Hora de última conexión
}
```

### Campos:
- **cuenta**: Nombre de la empresa (opcional para personas)
- **usuario**: Nombre del usuario (requerido)
- **perfil**: Tipo de perfil o rol (opcional)
- **hora_conexion**: Timestamp de la última conexión (opcional)

## 🚀 Formas de Uso

### Forma 1: Función Global Directa
```javascript
// Desde cualquier lugar en la aplicación
window.cargarDatosContenedor({
  cuenta: "INVERBALA 1651 CA",
  usuario: "Sr(a) CRISTINA GUATARAMA",
  perfil: "Master/Único",
  hora_conexion: "11/07/2026 01:36pm"
});
```

### Forma 2: String JSON
```javascript
const jsonString = '{"cuenta":"INVERBALA 1651 CA","usuario":"Sr(a) CRISTINA","perfil":"Master/Único","hora_conexion":"11/07/2026 01:36pm"}';
window.cargarDatosContenedor(jsonString);
```

### Forma 3: Usando el Loader Utility
```javascript
import { userDataLoader } from '@/utils/userDataLoader';

userDataLoader.load({
  cuenta: "INVERBALA 1651 CA",
  usuario: "Sr(a) CRISTINA GUATARAMA",
  perfil: "Master/Único",
  hora_conexion: "11/07/2026 01:36pm"
});
```

### Forma 4: Desde una Petición API
```javascript
import { userDataLoader } from '@/utils/userDataLoader';

fetch('/api/user-info')
  .then(res => res.json())
  .then(data => userDataLoader.load(data));
```

## 🎨 Comportamiento Visual

### Estado de Carga (Skeleton Loader)
- Muestra barras de carga animadas
- Mantiene la altura correcta
- Desaparece cuando los datos están listos

### Estado Vacío
- Si no hay datos: muestra "Cargando información..."
- Es un estado temporal

### Renderización Dinámica
- Si `perfil` está vacío: se oculta automáticamente
- Si `cuenta` está vacía: se oculta automáticamente
- Si `hora_conexion` está vacía: se oculta automáticamente
- Nunca quedan espacios en blanco o saltos de línea extraños

## 🔍 Ejemplos por Tipo de Usuario

### Para Empresas
```javascript
window.cargarDatosContenedor({
  cuenta: "INVERBALA 1651 CA",
  usuario: "Sr(a) CRISTINA GUATARAMA",
  perfil: "Master/Único",
  hora_conexion: "07/07/2026 08:26am"
});
```

### Para Personas (sin perfil y sin cuenta)
```javascript
window.cargarDatosContenedor({
  usuario: "Sr(a) CRISTINA GUATARAMA",
  hora_conexion: "04/07/2026 10:58am"
});
// Los campos cuenta y perfil se ocultarán automáticamente
```

### Para Personas (solo usuario y hora)
```javascript
window.cargarDatosContenedor({
  usuario: "Sr(a) JUAN PÉREZ",
  hora_conexion: "11/07/2026 02:15pm"
});
```

## 📱 Responsividad
- Funciona en Desktop, Tablet y Móvil
- Mantiene el mismo formato visual en todas las pantallas
- Los iconos y texto se adaptan al tamaño de pantalla

## ⚙️ Detalles Técnicos

### Estado Inicial
- Muestra skeleton loader
- Se oculta cuando los datos se cargan

### Limpieza de Datos
- Espacios extraños: `.trim()` automático
- Strings JSON: se parsean automáticamente
- Objetos: se aceptan directamente

### IDs de Elementos
```html
<span id="user-cuenta">...</span>      <!-- Nombre de empresa -->
<span id="user-nombre">...</span>      <!-- Nombre del usuario -->
<span id="user-perfil">...</span>      <!-- Perfil/rol -->
<span id="user-conexion">...</span>    <!-- Hora de conexión -->
```

## 🐛 Debugging

### Ver datos actuales en consola
```javascript
console.log(window.cargarDatosContenedor);
```

### Ver ejemplo de datos
```javascript
import { userDataLoader } from '@/utils/userDataLoader';
console.log(userDataLoader.example());
```

### Verificar que el componente está montado
```javascript
// Si esto existe, el componente está listo
if (window.cargarDatosContenedor) {
  console.log('✓ UserInfoContainer está montado');
} else {
  console.log('✗ UserInfoContainer no está montado aún');
}
```

## 🔄 Flujo de Integración Típico

1. **Usuario navega a DashboardEmpresas o DashboardPersonas**
2. **Componente UserInfoContainer se monta**
3. **Se expone `window.cargarDatosContenedor()`**
4. **Tu backend/API llama a `window.cargarDatosContenedor(datos)`**
5. **Los datos aparecen dinámicamente con animación**

## ✨ Características

✅ Carga dinámica sin refresco de página  
✅ Skeleton loader profesional  
✅ Manejo automático de campos opcionales  
✅ Limpieza de espacios extraños  
✅ Sin saltos de línea ni huecos  
✅ Compatible con Desktop, Tablet, Móvil  
✅ Funciona en ambas páginas (Empresas y Personas)  
✅ Resto de páginas no se ven afectadas  

## 📞 Soporte
Si hay problemas, verifica:
1. El formato JSON es correcto
2. El componente está montado (revisa la consola)
3. Los IDs de elementos existen en la página actual
