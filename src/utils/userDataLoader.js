/**
 * Sistema de carga dinámica de datos del usuario
 *
 * Uso:
 * - Llama a window.cargarDatosContenedor(datos) desde cualquier lugar
 * - El componente UserInfoContainer escuchará los cambios automáticamente
 *
 * Formato esperado:
 * {
 *   "cuenta": "NOMBRE DE LA EMPRESA O CUENTA",
 *   "usuario": "Sr(a) NOMBRE DEL USUARIO",
 *   "perfil": "Master/Único",
 *   "hora_conexion": "11/07/2026 01:36pm"
 * }
 *
 * Notas:
 * - Los campos "cuenta" y "perfil" son opcionales
 * - Si están vacíos o undefined, se ocultarán sin dejar huecos
 * - La función limpia automáticamente espacios extraños
 * - Funciona tanto con strings JSON como objetos JavaScript
 */

export const userDataLoader = {
  /**
   * Carga datos del usuario en el contenedor dinámico
   * @param {Object|string} jsonDatos - Objeto o string JSON con los datos
   */
  load: (jsonDatos) => {
    if (window.cargarDatosContenedor) {
      window.cargarDatosContenedor(jsonDatos);
    } else {
      console.warn('✗ Componente UserInfoContainer no está montado aún');
    }
  },

  /**
   * Ejemplo de uso
   */
  example: () => {
    const ejemploDatos = {
      cuenta: "INVERBALA 1651 CA",
      usuario: "Sr(a) CRISTINA GUATARAMA",
      perfil: "Master/Único",
      hora_conexion: "11/07/2026 01:36pm"
    };
    return ejemploDatos;
  }
};

// Exportar globalmente para acceso fácil
if (typeof window !== 'undefined') {
  window.userDataLoader = userDataLoader;
}
