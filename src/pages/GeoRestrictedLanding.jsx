import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function GeoRestrictedLanding() {
  /** @type {[string | null, (value: string | null) => void]} */
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-900">ACCESO RESTRINGIDO</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Este sitio está disponible solo en Venezuela
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Detectamos que te estás conectando desde fuera de nuestro país. Este contenido está diseñado exclusivamente para usuarios en Venezuela.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <div className="px-8 py-4 bg-white rounded-lg border-2 border-slate-200 text-center">
              <p className="text-sm text-slate-600">Tu ubicación detectada:</p>
              <p className="text-lg font-bold text-slate-900">Fuera de Venezuela</p>
            </div>
          </div>
        </div>

        {/* Info Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3">¿Por qué esta restricción?</h3>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Contenido optimizado para usuarios en Venezuela</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Cumplimiento de regulaciones locales</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Protección de datos y privacidad</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Experiencia personalizada por geografía</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3">Información Importante</h3>
            <p className="text-slate-700 mb-3">
              Si crees que deberías tener acceso a este contenido, por favor verifica tu ubicación o VPN.
            </p>
            <div className="bg-blue-100 rounded-lg p-4 text-sm text-blue-900">
              <p className="font-semibold mb-1">Nota de seguridad:</p>
              <p>No compartimos información de tu ubicación. Esta verificación se realiza localmente en tu navegador.</p>
            </div>
          </div>
        </div>

        {/* Legal & Policy Sections */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {/* Terms of Service */}
            <div>
              <button
                onClick={() => toggleSection('terms')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Términos de Servicio</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'terms' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'terms' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. ACEPTACIÓN DE TÉRMINOS</strong><br/>
                    Al acceder a este sitio web, usted acepta cumplir con estos términos de servicio y todas las leyes y regulaciones aplicables.
                  </p>
                  <p>
                    <strong>2. RESTRICCIÓN GEOGRÁFICA</strong><br/>
                    Este sitio está disponible exclusivamente para usuarios ubicados en Venezuela. El acceso desde otras ubicaciones geográficas está restringido.
                  </p>
                  <p>
                    <strong>3. LICENCIA DE USO</strong><br/>
                    Se le otorga una licencia limitada, no exclusiva y revocable para usar este sitio web únicamente para propósitos personales y no comerciales.
                  </p>
                  <p>
                    <strong>4. DESCARGO DE RESPONSABILIDAD</strong><br/>
                    El contenido se proporciona "tal cual". No ofrecemos garantías de ningún tipo, expresas o implícitas, incluyendo pero no limitado a garantías de comerciabilidad o idoneidad para un propósito particular.
                  </p>
                  <p>
                    <strong>5. LIMITACIÓN DE RESPONSABILIDAD</strong><br/>
                    En ningún caso seremos responsables por daños directos, indirectos, incidentales, especiales o consecuentes derivados del uso de este sitio.
                  </p>
                  <p>
                    <strong>6. MODIFICACIONES</strong><br/>
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigencia inmediatamente.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Policy */}
            <div>
              <button
                onClick={() => toggleSection('privacy')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Política de Privacidad</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'privacy' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'privacy' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. RECOPILACIÓN DE INFORMACIÓN</strong><br/>
                    Recopilamos información de navegación incluyendo dirección IP, tipo de navegador y páginas visitadas. Esta información se utiliza para mejorar nuestros servicios.
                  </p>
                  <p>
                    <strong>2. INFORMACIÓN DE UBICACIÓN</strong><br/>
                    Utilizamos servicios de geolocalización para verificar tu ubicación geográfica. Esta información se procesa localmente en tu navegador y no se almacena en nuestros servidores.
                  </p>
                  <p>
                    <strong>3. COOKIES</strong><br/>
                    Utilizamos cookies para mejorar tu experiencia de navegación. Puedes controlar las cookies a través de la configuración de tu navegador.
                  </p>
                  <p>
                    <strong>4. PROTECCIÓN DE DATOS</strong><br/>
                    Empleamos medidas de seguridad estándar de la industria para proteger tu información personal contra acceso no autorizado.
                  </p>
                  <p>
                    <strong>5. TERCEROS</strong><br/>
                    No vendemos ni compartimos tu información personal con terceros, excepto cuando sea requerido por ley.
                  </p>
                  <p>
                    <strong>6. DERECHOS DE PRIVACIDAD</strong><br/>
                    Tienes derecho a acceder, corregir o eliminar tu información personal. Contáctanos para ejercer estos derechos.
                  </p>
                  <p>
                    <strong>7. CAMBIOS A ESTA POLÍTICA</strong><br/>
                    Nos reservamos el derecho de modificar esta política. Las modificaciones entran en vigencia cuando se publican.
                  </p>
                </div>
              )}
            </div>

            {/* Cookie Policy */}
            <div>
              <button
                onClick={() => toggleSection('cookies')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Política de Cookies</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'cookies' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'cookies' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. ¿QUÉ SON LAS COOKIES?</strong><br/>
                    Las cookies son pequeños archivos de texto almacenados en tu dispositivo que ayudan a mejorar tu experiencia de navegación.
                  </p>
                  <p>
                    <strong>2. TIPOS DE COOKIES</strong><br/>
                    Utilizamos cookies esenciales (necesarias para el funcionamiento), analíticas (para entender cómo usas el sitio) y de preferencia (para recordar tus configuraciones).
                  </p>
                  <p>
                    <strong>3. COOKIES DE TERCEROS</strong><br/>
                    Podemos permitir que terceros coloquen cookies para análisis y publicidad. Estos terceros tienen sus propias políticas de privacidad.
                  </p>
                  <p>
                    <strong>4. CONTROL DE COOKIES</strong><br/>
                    Puedes controlar las cookies a través de la configuración de tu navegador. La mayoría de navegadores te permiten rechazar cookies o alertarte cuando se están utilizando.
                  </p>
                  <p>
                    <strong>5. CONSENTIMIENTO</strong><br/>
                    Al utilizar este sitio, consientes nuestro uso de cookies según se describe en esta política.
                  </p>
                </div>
              )}
            </div>

            {/* Ads Policy */}
            <div>
              <button
                onClick={() => toggleSection('ads')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Política de Publicidad</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'ads' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'ads' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. ANUNCIOS DE GOOGLE ADSENSE</strong><br/>
                    Este sitio contiene anuncios servidos por Google y otros proveedores de publicidad. Estos anuncios pueden incluir cookies para personalización.
                  </p>
                  <p>
                    <strong>2. INFORMACIÓN RECOPILADA POR ANUNCIANTES</strong><br/>
                    Los anunciantes pueden recopilar información sobre tu comportamiento de navegación para mostrar anuncios relevantes.
                  </p>
                  <p>
                    <strong>3. POLÍTICA DE GOOGLE ADSENSE</strong><br/>
                    El contenido publicitario está sujeto a la Política de Google Adsense. No permitimos publicidad falsa, engañosa o prohibida.
                  </p>
                  <p>
                    <strong>4. CONSENTIMIENTO PARA PUBLICIDAD PERSONALIZADA</strong><br/>
                    Al usar este sitio, aceptas que podemos mostrar publicidad personalizada basada en tu comportamiento de navegación.
                  </p>
                  <p>
                    <strong>5. CONTROL DE PUBLICIDAD</strong><br/>
                    Puedes controlar la publicidad personalizada a través de la configuración de privacidad de Google.
                  </p>
                  <p>
                    <strong>6. INCUMPLIMIENTO</strong><br/>
                    Cualquier intento de manipular o defraudar nuestro sistema de publicidad resultará en acciones legales.
                  </p>
                </div>
              )}
            </div>

            {/* Legal Notice */}
            <div>
              <button
                onClick={() => toggleSection('legal')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Aviso Legal</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'legal' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'legal' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. IDENTIDAD DEL RESPONSABLE</strong><br/>
                    Titular: Victor Daniel Avendaño Monsalve<br/>
                    Dirección: Urb. La Concordia, Calle 6, con Vereda 3, Barquisimeto 3001, Lara, Venezuela<br/>
                    Email: contacto@activofinantry.blog
                  </p>
                  <p>
                    <strong>2. DOMINIO RESPONSABLE</strong><br/>
                    Este sitio web está bajo responsabilidad del titular mencionado arriba.
                  </p>
                  <p>
                    <strong>3. CONTENIDO</strong><br/>
                    Aunque nos esforzamos por mantener la información precisa y actualizada, no podemos garantizar la exactitud total del contenido en este sitio.
                  </p>
                  <p>
                    <strong>4. ENLACES EXTERNOS</strong><br/>
                    Este sitio puede contener enlaces a otros sitios web. No somos responsables por el contenido de sitios web de terceros.
                  </p>
                  <p>
                    <strong>5. PROPIEDAD INTELECTUAL</strong><br/>
                    Todo el contenido, incluyendo texto, gráficos, logotipos y software, está protegido por derechos de autor.
                  </p>
                  <p>
                    <strong>6. JURISDICCIÓN</strong><br/>
                    Estos términos se rigen por las leyes de Venezuela. Cualquier disputa se someterá a los tribunales competentes.
                  </p>
                </div>
              )}
            </div>

            {/* Data Protection */}
            <div>
              <button
                onClick={() => toggleSection('protection')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Protección de Datos</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'protection' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'protection' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. SEGURIDAD</strong><br/>
                    Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado.
                  </p>
                  <p>
                    <strong>2. ENCRIPTACIÓN</strong><br/>
                    Los datos sensibles se transmiten usando encriptación SSL/TLS de 256 bits.
                  </p>
                  <p>
                    <strong>3. ACCESO A DATOS</strong><br/>
                    Solo el personal autorizado puede acceder a tus datos personales.
                  </p>
                  <p>
                    <strong>4. RETENCIÓN</strong><br/>
                    Conservamos tus datos solo mientras sea necesario para los propósitos indicados en nuestra política de privacidad.
                  </p>
                  <p>
                    <strong>5. DERECHOS DEL USUARIO</strong><br/>
                    Tienes derecho a acceder, rectificar, cancelar u oponerme al tratamiento de tus datos personales.
                  </p>
                </div>
              )}
            </div>

            {/* Compliance */}
            <div>
              <button
                onClick={() => toggleSection('compliance')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <h3 className="text-lg font-bold text-slate-900">Cumplimiento Legal</h3>
                <ChevronDown
                  size={20}
                  className={`text-slate-600 transition-transform ${
                    expandedSection === 'compliance' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'compliance' && (
                <div className="px-6 py-4 bg-slate-50 text-sm text-slate-700 space-y-3 max-h-96 overflow-y-auto">
                  <p>
                    <strong>1. CUMPLIMIENTO DE GOOGLE ADS</strong><br/>
                    Este sitio cumple con todas las políticas de Google Adsense y Google Ads, incluyendo prohibición de contenido engañoso, violencia, y material adulto.
                  </p>
                  <p>
                    <strong>2. NORMATIVA VENEZOLANA</strong><br/>
                    Nuestras operaciones cumplen con la legislación venezolana aplicable.
                  </p>
                  <p>
                    <strong>3. PROHIBICIONES</strong><br/>
                    Prohíbe específicamente: sitios de juego o apuestas, esquemas piramidales, productos falsificados, medicamentos ilegales, armas, acoso y explotación.
                  </p>
                  <p>
                    <strong>4. CONTENIDO PROHIBIDO</strong><br/>
                    No permitimos contenido que viole derechos de autor, sea falso, o incite violencia.
                  </p>
                  <p>
                    <strong>5. CUMPLIMIENTO CONTINUO</strong><br/>
                    Monitoreamos continuamente nuestro contenido para asegurar cumplimiento con todas las políticas aplicables.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600 mb-4">
            © 2026 Activo Finantry. Todos los derechos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-4 text-xs text-slate-500">
            <a href="/legal-notice.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Aviso Legal</a>
            <span>•</span>
            <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacidad</a>
            <span>•</span>
            <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Términos</a>
            <span>•</span>
            <a href="/cookie-policy.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Cookies</a>
            <span>•</span>
            <a href="/ads-policy.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Política de Anuncios</a>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl mx-auto">
            Este sitio cumple completamente con las políticas de Google Adsense y Google Ads.
            No somos una institución financiera. Contenido exclusivamente informativo y educativo.
          </p>
        </div>
      </div>
    </div>
  );
}
