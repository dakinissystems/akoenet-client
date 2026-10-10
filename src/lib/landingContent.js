/** Copy for the public landing page (EN default, ES alternate). */

/** Public marketing / company site (Dakinys Systems). */
export const DAKINIS_SYSTEMS_URL =
  String(import.meta.env.VITE_DAKINIS_CORPORATE_URL || '').trim() || 'https://dakinissystems.com/'

export const landingContent = {
  en: {
    nav: {
      features: 'Features',
      downloads: 'Downloads',
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
        a: 'No — chat, voice, invites, and StreamAutomator work in the browser. The Windows desktop app is optional: use it for local game detection and a native window. Download it from Downloads. On Android, install from Google Play once listed (not a Chrome extension).',
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
    appTeaser: {
      title: 'Prefer the desktop app?',
      lead:
        'Optional on Windows for a native window and local game detection. Everything else works in the browser.',
      windowsCta: 'Download for Windows',
      allPlatforms: 'All platforms & install help',
      versionLabel: 'Desktop v{{v}}',
      updatedLabel: 'Updated {{d}}',
    },
    downloadPage: {
      documentTitle: 'Downloads — AkoeNet',
      eyebrow: 'Apps',
      title: 'Download AkoeNet',
      lead:
        'Install the desktop or mobile client when you want them. Core community features stay available in the browser.',
      webFirst:
        'Chat, voice, invites, StreamAutomator, and Steam-linked presence work on the web. The Windows app adds local game detection and a dedicated window.',
      platformsLabel: 'Platforms',
      backHome: '← Back to home',
      otherDesktopTitle: 'macOS & Linux',
      otherDesktopBody: 'Native builds are not available yet. Use AkoeNet in your browser for now.',
      desktop: {
        nativeTitle: 'Windows',
        nativeBodyHosted:
          'Installer for Windows 10/11 (64-bit). Native window, Twitch sign-in, and optional local game detection.',
        optionalNote:
          'Required only if you want desktop game detection. Twitch sign-in and communities also work in the browser.',
        notExtensionNote: 'Not a Chrome extension, Edge add-on, or browser-store app.',
        nativeDownloadCta: 'Download for Windows (x64)',
        installerVersionHint: 'Version {{v}}',
        installerUpdatedHint: 'updated {{d}}',
        webAheadHint:
          'The website is on {{web}}. This installer may be older until the next desktop release; installed apps can auto-update when a newer signed build is published.',
        smartscreenHint:
          'Windows SmartScreen may warn about an unknown publisher until we ship an Authenticode-signed build. Choose “More info” → “Run anyway” if you trust this site.',
        installSteps:
          'After download: run the .exe → if SmartScreen appears, use More info → Run anyway → finish the installer → sign in. Prefer the web app if you are unsure.',
        unavailable: 'Installer temporarily unavailable. Use the web app or try again later.',
      },
      mobile: {
        androidTitle: 'Android',
        androidBodyPending:
          'The Android app is in Google Play review. When approved, install from the store or download the APK here.',
        androidBodyApproved:
          'Install from Google Play or download the APK. Full-screen app with push notifications.',
        playStoreCta: 'Get it on Google Play',
        apkCta: 'Download APK',
        notExtensionNote: 'Not a Chrome extension or browser add-on.',
        iosTitle: 'iPhone & iPad',
        iosBody: 'App Store listing coming later. Until then, use AkoeNet in Safari.',
      },
    },
  },
  es: {
    nav: {
      features: 'Funciones',
      downloads: 'Descargas',
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
        a: 'No — chat, voz, invitaciones y StreamAutomator funcionan en el navegador. La app de escritorio Windows es opcional: úsala para detección local de juegos y ventana nativa. Descárgala en Descargas. En Android, instálala desde Google Play cuando esté publicada (no es una extensión de Chrome).',
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
    appTeaser: {
      title: '¿Prefieres la app de escritorio?',
      lead:
        'Opcional en Windows para ventana nativa y detección local de juegos. El resto funciona en el navegador.',
      windowsCta: 'Descargar para Windows',
      allPlatforms: 'Todas las plataformas e instalación',
      versionLabel: 'Escritorio v{{v}}',
      updatedLabel: 'Actualizado {{d}}',
    },
    downloadPage: {
      documentTitle: 'Descargas — AkoeNet',
      eyebrow: 'Apps',
      title: 'Descargar AkoeNet',
      lead:
        'Instala el cliente de escritorio o móvil cuando lo necesites. Las funciones principales de comunidad siguen en el navegador.',
      webFirst:
        'Chat, voz, invitaciones, StreamAutomator y presencia vía Steam funcionan en la web. La app Windows añade detección local de juegos y una ventana dedicada.',
      platformsLabel: 'Plataformas',
      backHome: '← Volver al inicio',
      otherDesktopTitle: 'macOS y Linux',
      otherDesktopBody: 'Aún no hay builds nativos. Usa AkoeNet en el navegador por ahora.',
      desktop: {
        nativeTitle: 'Windows',
        nativeBodyHosted:
          'Instalador para Windows 10/11 (64 bits). Ventana nativa, inicio con Twitch y detección local de juegos opcional.',
        optionalNote:
          'Solo es necesaria si quieres detección de juegos en el escritorio. Twitch y las comunidades también funcionan en el navegador.',
        notExtensionNote: 'No es extensión de Chrome, ni complemento de Edge, ni de la tienda del navegador.',
        nativeDownloadCta: 'Descargar para Windows (x64)',
        installerVersionHint: 'Versión {{v}}',
        installerUpdatedHint: 'actualizado {{d}}',
        webAheadHint:
          'La web está en {{web}}. Este instalador puede ser anterior hasta el próximo release de escritorio; las apps instaladas pueden autoactualizarse cuando haya un build firmado más nuevo.',
        smartscreenHint:
          'Windows SmartScreen puede avisar de “editor desconocido” hasta que firmemos el instalador con Authenticode. Elige “Más información” → “Ejecutar de todas formas” si confías en este sitio.',
        installSteps:
          'Tras descargar: ejecuta el .exe → si aparece SmartScreen, Más información → Ejecutar de todas formas → termina el instalador → inicia sesión. Si dudas, usa la web.',
        unavailable: 'Instalador no disponible temporalmente. Usa la web o inténtalo más tarde.',
      },
      mobile: {
        androidTitle: 'Android',
        androidBodyPending:
          'La app está en revisión en Google Play. Cuando se apruebe, instálala desde la tienda o descarga el APK aquí.',
        androidBodyApproved:
          'Instala desde Google Play o descarga el APK. App a pantalla completa con notificaciones.',
        playStoreCta: 'Disponible en Google Play',
        apkCta: 'Descargar APK',
        notExtensionNote: 'No es extensión ni complemento del navegador.',
        iosTitle: 'iPhone e iPad',
        iosBody: 'La ficha en App Store llegará más adelante. Mientras tanto, usa AkoeNet en Safari.',
      },
    },
  },
}

export const footerContent = {
  en: {
    versionTitle: 'Web client version',
    downloads: 'Downloads',
    legalNav: 'Legal links',
    legalGroupPrimary: 'Account & safety',
    legalGroupSecondary: 'Legal & compliance',
    terms: 'Terms',
    privacy: 'Privacy',
    legal: 'Legal',
    dmca: 'DMCA',
    dpo: 'Privacy requests',
    accountDeletion: 'Delete account',
    childSafety: 'Child safety',
    cookies: 'Cookies',
    moderation: 'Moderation',
    security: 'Security',
    transparency: 'DSA transparency',
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
    downloads: 'Descargas',
    legalNav: 'Enlaces legales',
    legalGroupPrimary: 'Cuenta y seguridad',
    legalGroupSecondary: 'Legal y cumplimiento',
    terms: 'Términos',
    privacy: 'Privacidad',
    legal: 'Legal',
    dmca: 'DMCA',
    dpo: 'Solicitudes de privacidad',
    accountDeletion: 'Borrar cuenta',
    childSafety: 'Seguridad infantil',
    cookies: 'Cookies',
    moderation: 'Moderación',
    security: 'Seguridad',
    transparency: 'Transparencia DSA',
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
const authFooter = {
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

function resolveAuthFooterLocale() {
  if (typeof navigator === 'undefined') return 'en'
  const lang = String(navigator.language || '').toLowerCase()
  return lang.startsWith('es') ? 'es' : 'en'
}
