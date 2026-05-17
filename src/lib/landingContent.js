/** Copy for the public landing page (EN default, ES alternate). */

/** Public marketing / company site (Dakinys Systems). */
export const DAKINIS_SYSTEMS_URL = 'https://dakinissystems.onrender.com/'

export const landingContent = {
  en: {
    nav: {
      features: 'Features',
      app: 'App',
      faq: 'FAQ',
      terms: 'Terms',
      privacy: 'Privacy',
      signIn: 'Sign in',
      signUp: 'Create account',
      langLabel: 'Language',
    },
    hero: {
      eyebrow: 'Communities + streaming',
      title: 'Organize your community and your streaming schedule',
      lead:
        'Built-in StreamAutomator commands (`!schedule`, `!next`), servers with text and voice, DMs, mentions, and roles — more than a chat platform, built for communities and streamers.',
      ctaPrimary: 'Get started',
      ctaSecondary: 'I already have an account',
    },
    presenceSection: {
      eyebrow: 'Live game presence',
      title: 'See what your server is playing — without juggling apps',
      lead:
        'AkoeNet shows who is in which game: connect Steam for automatic “now playing”, type a manual status for any store or console, or opt in to desktop detection in the Windows app. Sharing is off until you enable it; auto-detection stays off by default.',
      bullets: [
        'Per-server trending list (“who is playing what” right now)',
        'Steam via official Web API when you link your account',
        'Manual line for Epic, Riot, consoles, or games Steam does not surface',
      ],
    },
    featuresTitle: 'What you get',
    featureCards: [
      {
        title: 'StreamAutomator',
        body: 'Show upcoming streams from the public Scheduler API with simple chat commands; set your slug in user settings.',
      },
      {
        title: 'Live chat',
        body: 'Instant channel messages, reactions, pins, mentions, search, and history export.',
      },
      {
        title: 'Voice & camera',
        body: 'WebRTC voice rooms with mute, level meter, and per-participant volume.',
      },
      {
        title: 'Roles & permissions',
        body: 'Control who can view, send, or connect in each channel.',
      },
      {
        title: 'Direct messages',
        body: 'Private conversations between members without leaving the app.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What is AkoeNet?',
        a: 'A community-style platform with servers, text and voice channels, direct messages, and role-based permissions — built for groups that want real-time chat and WebRTC voice.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'You can use AkoeNet in the browser without installing anything. On Windows, download the desktop app from the “App” section. On Android, install from Google Play once listed (not a Chrome extension). You need an account and, for voice, microphone permission (and camera if you use it).',
      },
      {
        q: 'How do voice channels work?',
        a: 'They use WebRTC between browsers, with signaling over Socket.IO. On restrictive networks you may need TURN servers configured in the frontend (VITE_ICE_SERVERS).',
      },
      {
        q: 'Can I sign in with Twitch?',
        a: 'If the deployment admin has configured Twitch OAuth on the backend, you will see it on the sign-in screen.',
      },
      {
        q: 'Where are the terms and privacy policy?',
        a: 'Use the footer links: Terms of Service, Privacy Policy, Cookie policy, and Legal notice. You can accept or reject non-essential storage in the cookie banner.',
      },
      {
        q: 'Why does Windows or Chrome warn that the desktop download is dangerous?',
        a: 'The desktop .exe is not signed with a commercial code-signing certificate. Browsers and Windows SmartScreen commonly flag unknown publishers. If you trust this site, you can keep the file; on SmartScreen use “More info” → “Run anyway,” or use the web app / PWA instead. Signing the build with Authenticode (paid certificate) reduces those warnings.',
      },
    ],
    apiOfflineBanner: {
      message:
        'We can’t reach the API server. Sign-in may not work until the backend is available (check VITE_API_URL or wait for the service to wake up).',
      retry: 'Retry connection',
    },
    inviteJoin: {
      title: 'Have an invite?',
      hint: 'Paste the full link or the short code from your host. You can sign in or create an account on the next screen.',
      placeholder: 'Invite link or code',
      button: 'Continue',
      error: 'Paste a link or invite code.',
    },
    appSection: {
      title: 'Download the app',
      lead:
        'On Windows, download the desktop installer. On Android, get the app from Google Play once approved — or download the APK when we publish it. This is not a Chrome or Edge extension.',
      notExtensionLead:
        'AkoeNet is a standalone app (desktop or store install). We do not offer a browser extension.',
      webFallback: 'You can also use AkoeNet in this browser — sign in above with no install.',
      desktop: {
        nativeTitle: 'Windows desktop app',
        nativeBodyHosted:
          'Download the installer for Windows 10/11 (64-bit). Native window with Twitch sign-in and game presence — not a browser extension.',
        notExtensionNote: 'Not a Chrome extension, not an Edge add-on, and not from a browser store.',
        nativeDownloadCta: 'Download for Windows (x64)',
        installerVersionHint: 'Version {{v}}',
        smartscreenHint:
          'Windows may show SmartScreen for new publishers. Choose “More info” → “Run anyway” if you trust this site.',
        nonWindowsHint: 'This installer is for Windows. On macOS or Linux, use the web app in your browser for now.',
      },
      mobile: {
        androidTitle: 'Android app',
        androidBodyPending:
          'The AkoeNet Android app is in Google Play review. When approved, you will be able to install it from the store or download the APK here. Not a browser extension.',
        androidBodyApproved:
          'Install AkoeNet from Google Play or download the APK below. Full-screen app with push notifications — not a Chrome extension.',
        playStoreCta: 'Get it on Google Play',
        apkCta: 'Download APK',
        notExtensionNote: 'Not a Chrome extension or browser add-on.',
        iosTitle: 'iPhone & iPad',
        iosBody: 'The iOS app will be listed on the App Store when available. Until then, use AkoeNet in Safari in your browser.',
        otherTitle: 'Mobile browser',
        otherBody: 'Use AkoeNet in your browser, or switch to Android when the store listing is live.',
      },
    },
  },
  es: {
    nav: {
      features: 'Funciones',
      app: 'App',
      faq: 'FAQ',
      terms: 'Términos',
      privacy: 'Privacidad',
      signIn: 'Entrar',
      signUp: 'Crear cuenta',
      langLabel: 'Idioma',
    },
    hero: {
      eyebrow: 'Comunidades + streaming',
      title: 'Organiza tu comunidad y tu calendario de streams',
      lead:
        'Integración con StreamAutomator (`!schedule`, `!next`), servidores con texto y voz, DM, menciones y roles — una plataforma amplia, pensada para comunidades y streamers.',
      ctaPrimary: 'Empezar gratis',
      ctaSecondary: 'Ya tengo cuenta',
    },
    presenceSection: {
      eyebrow: 'Presencia de juego en vivo',
      title: 'Ve qué juega tu servidor sin abrir más apps',
      lead:
        'AkoeNet muestra quién está en qué juego: conecta Steam para el “jugando ahora”, escribe un estado manual para cualquier tienda o consola, o activa la detección en el escritorio (app Windows). Tú decides qué compartir; la detección automática va desactivada por defecto.',
      bullets: [
        'Tendencias por servidor (quién juega a qué en este momento)',
        'Steam con la API oficial cuando enlazas la cuenta',
        'Línea manual para Epic, Riot, consolas o juegos que Steam no publica',
      ],
    },
    featuresTitle: 'Funciones principales',
    featureCards: [
      {
        title: 'StreamAutomator',
        body: 'Muestra próximos streams desde la API pública del Scheduler con comandos en el chat; configura tu slug en ajustes de usuario.',
      },
      {
        title: 'Chat en vivo',
        body: 'Mensajes por canal, reacciones, pins, menciones, búsqueda y exportación de historial.',
      },
      {
        title: 'Voz y cámara',
        body: 'Canales de voz WebRTC con mute, medidor y volumen por participante.',
      },
      {
        title: 'Roles y permisos',
        body: 'Control de quién ve, escribe o se conecta a cada canal.',
      },
      {
        title: 'Mensajes directos',
        body: 'Conversaciones privadas entre miembros sin salir del flujo de la app.',
      },
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        q: '¿Qué es AkoeNet?',
        a: 'Una plataforma tipo comunidad con servidores, canales de texto y voz, mensajes directos y permisos por roles. Pensada para grupos que quieren chat en tiempo real y salas de voz con WebRTC.',
      },
      {
        q: '¿Necesito instalar algo?',
        a: 'Puedes usar AkoeNet en el navegador sin instalar nada. En Windows, descarga la app de escritorio en la sección “App”. En Android, instálala desde Google Play cuando esté publicada (no es una extensión de Chrome). Necesitas cuenta y, para voz, permiso de micrófono (y cámara si la usas).',
      },
      {
        q: '¿Cómo funcionan los canales de voz?',
        a: 'Usan WebRTC entre navegadores, con señalización por Socket.IO. En redes restringidas puede hacer falta configurar servidores TURN en el frontend (variable VITE_ICE_SERVERS).',
      },
      {
        q: '¿Puedo usar Twitch para entrar?',
        a: 'Si el administrador del despliegue ha configurado OAuth de Twitch en el backend, verás la opción en la pantalla de inicio de sesión.',
      },
      {
        q: '¿Dónde leo términos y privacidad?',
        a: 'En el pie de página: Términos, Privacidad, Política de cookies, Moderación de contenidos y aviso legal. Puedes aceptar o rechazar lo no esencial en el banner de cookies.',
      },
      {
        q: '¿Por qué Windows o Chrome dicen que la descarga de escritorio es peligrosa?',
        a: 'El .exe no está firmado con un certificado de firma de código de un editor comercial. Es normal que el navegador y Windows SmartScreen adviertan por “editor desconocido”. Si confías en este sitio, puedes conservar el archivo; en SmartScreen: “Más información” → “Ejecutar de todas formas”, o usa la web/PWA. Para repartir la app con menos avisos hay que firmar el ejecutable con Authenticode (certificado de pago).',
      },
    ],
    apiOfflineBanner: {
      message:
        'No hay conexión con el servidor. El inicio de sesión puede fallar hasta que el backend esté disponible (revisa VITE_API_URL o espera a que el servicio arranque).',
      retry: 'Reintentar',
    },
    inviteJoin: {
      title: '¿Tienes una invitación?',
      hint: 'Pega el enlace completo o el código que te pasó el anfitrión. Si no tienes cuenta, podrás crearla en el siguiente paso.',
      placeholder: 'Enlace o código de invitación',
      button: 'Continuar',
      error: 'Pega un enlace o un código de invitación.',
    },
    appSection: {
      title: 'Descargar la app',
      lead:
        'En Windows, descarga el instalador de escritorio. En Android, instálala desde Google Play cuando esté aprobada — o descarga el APK cuando lo publiquemos. No es una extensión de Chrome ni de Edge.',
      notExtensionLead:
        'AkoeNet es una aplicación independiente (escritorio o tienda). No ofrecemos extensión de navegador.',
      webFallback: 'También puedes usar AkoeNet en este navegador — entra arriba sin instalar nada.',
      desktop: {
        nativeTitle: 'App de escritorio para Windows',
        nativeBodyHosted:
          'Descarga el instalador para Windows 10/11 (64 bits). Ventana nativa con inicio de sesión Twitch y presencia de juego — no es una extensión del navegador.',
        notExtensionNote: 'No es extensión de Chrome, ni complemento de Edge, ni de la tienda del navegador.',
        nativeDownloadCta: 'Descargar para Windows (x64)',
        installerVersionHint: 'Versión {{v}}',
        smartscreenHint:
          'Windows puede mostrar SmartScreen con editores nuevos. Elige “Más información” → “Ejecutar de todas formas” si confías en este sitio.',
        nonWindowsHint: 'Este instalador es para Windows. En macOS o Linux, usa la web en el navegador por ahora.',
      },
      mobile: {
        androidTitle: 'App para Android',
        androidBodyPending:
          'La app de AkoeNet está en revisión en Google Play. Cuando se apruebe, podrás instalarla desde la tienda o descargar el APK aquí. No es una extensión del navegador.',
        androidBodyApproved:
          'Instala AkoeNet desde Google Play o descarga el APK abajo. App a pantalla completa con notificaciones — no es extensión de Chrome.',
        playStoreCta: 'Disponible en Google Play',
        apkCta: 'Descargar APK',
        notExtensionNote: 'No es extensión ni complemento del navegador.',
        iosTitle: 'iPhone e iPad',
        iosBody: 'La app para iOS estará en la App Store cuando esté disponible. Mientras tanto, usa AkoeNet en Safari.',
        otherTitle: 'Móvil en el navegador',
        otherBody: 'Usa AkoeNet en el navegador, o cambia a Android cuando la ficha en la tienda esté activa.',
      },
    },
  },
}

export const footerContent = {
  en: {
    versionTitle: 'Web client version',
    legalNav: 'Legal links',
    legalGroupPrimary: 'Account & safety',
    legalGroupSecondary: 'Legal & compliance',
    terms: 'Terms',
    privacy: 'Privacy',
    legal: 'Legal',
    dmca: 'DMCA',
    dpo: 'Data rights',
    accountDeletion: 'Delete account',
    childSafety: 'Child safety',
    cookies: 'Cookies',
    moderation: 'Moderation',
    legalContact: 'Legal & DSA contact',
    status: 'Status',
    copyrightReserved: 'All rights reserved.',
    copyrightSubject: 'Use is subject to',
    copyrightBetweenLinks: 'and',
    independentNotice: 'AkoeNet is independent and is not affiliated with Discord Inc.',
    twitchDisclaimer:
      'Twitch is a trademark of Twitch Interactive, Inc. This service is not affiliated with Twitch.',
  },
  es: {
    versionTitle: 'Versión del cliente web',
    legalNav: 'Enlaces legales',
    legalGroupPrimary: 'Cuenta y seguridad',
    legalGroupSecondary: 'Legal y cumplimiento',
    terms: 'Términos',
    privacy: 'Privacidad',
    legal: 'Legal',
    dmca: 'DMCA',
    dpo: 'Derechos de datos',
    accountDeletion: 'Borrar cuenta',
    childSafety: 'Seguridad infantil',
    cookies: 'Cookies',
    moderation: 'Moderación',
    legalContact: 'Contacto legal y DSA',
    status: 'Estado',
    copyrightReserved: 'Todos los derechos reservados.',
    copyrightSubject: 'El uso está sujeto a',
    copyrightBetweenLinks: 'y',
    independentNotice: 'AkoeNet es independiente y no está afiliado a Discord Inc.',
    twitchDisclaimer:
      'Twitch es una marca de Twitch Interactive, Inc. Este servicio no está afiliado a Twitch.',
  },
}

/** Login/register: browser language → footer-style legal line (no landing locale in tree). */
export const authFooter = {
  en: {
    copyrightReserved: 'All rights reserved.',
    copyrightSubject: 'Use is subject to',
    copyrightBetweenLinks: 'and',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
  },
  es: {
    copyrightReserved: 'Todos los derechos reservados.',
    copyrightSubject: 'El uso está sujeto a',
    copyrightBetweenLinks: 'y',
    terms: 'Términos del servicio',
    privacy: 'Política de privacidad',
  },
}

export function resolveAuthFooterLocale() {
  if (typeof navigator === 'undefined') return 'en'
  const lang = String(navigator.language || '').toLowerCase()
  return lang.startsWith('es') ? 'es' : 'en'
}
