/* ==========================================================================
   AUTHENTIC PROJECTS CATALOG, SOCIAL LINKS & CONSTANTS
   100% preserved from original portfolio without fabricated metrics or years.
   ========================================================================== */

export const GITHUB_USERNAME = "ibrahimtemur";
export const EMAIL_ADDRESS = "ibrahimtemur847@gmail.com";

export const SOCIAL_LINKS = [
  {
    id: "github",
    name: "GitHub",
    handle: "@ibrahimtemur",
    url: "https://github.com/ibrahimtemur",
    icon: "github"
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "/in/ibrahim-temur",
    url: "https://www.linkedin.com/in/ibrahim-temur/",
    icon: "linkedin"
  },
  {
    id: "appstore",
    name: "App Store",
    handle: "Developer · İbrahim Temur",
    url: "https://apps.apple.com/us/developer/ibrahim-temur/id6812348432",
    icon: "apple"
  },
  {
    id: "playstore",
    name: "Google Play",
    handle: "Developer · İbrahim Temur",
    url: "https://play.google.com/store/apps/developer?id=%C4%B0brahim+Temur",
    icon: "play"
  },
  {
    id: "email",
    name: "Email",
    handle: "ibrahimtemur847@gmail.com",
    url: "mailto:ibrahimtemur847@gmail.com",
    icon: "mail"
  },
  {
    id: "x",
    name: "X (Twitter)",
    handle: "@ibrahim_temur_",
    url: "https://x.com/ibrahim_temur_",
    icon: "x"
  },
  {
    id: "instagram",
    name: "Instagram",
    handle: "@ibrahimtemurr_",
    url: "https://www.instagram.com/ibrahimtemurr_/",
    icon: "instagram"
  }
];

export const PROJECTS_DATA = [
  {
    id: "mac-remote-app",
    repoName: "mac-remote-app",
    categories: ["mobile", "desktop"],
    primaryCategory: "mobile",
    stars: 2,
    forks: 0,
    language: "Python",
    title: {
      tr: "Mac Remote (Desktop Remote) — iOS, Android & macOS",
      en: "Mac Remote (Desktop Remote) — iOS, Android & macOS"
    },
    categoryBadge: {
      tr: "Mobil & Sistem · Mağazada Yayında",
      en: "Mobile & Systems · On App Stores"
    },
    description: {
      tr: "iPhone, iPad ve Android cihazları macOS için ultra düşük gecikmeli kablosuz trackpad, klavye, medya kumandası ve 2200p canlı ekran yansıtıcısına dönüştüren çapraz platform sistem. Google Play ve App Store'da yayında.",
      en: "Cross-platform ecosystem turning iPhone, iPad, and Android devices into an ultra-low-latency wireless trackpad, keyboard, media controller, and 2200p live screen mirror for macOS. Published on Google Play & App Store."
    },
    tech: [
      "Python & PyQt6",
      "SwiftUI (iOS)",
      "Kotlin & Compose",
      "WebSockets",
      "CoreGraphics Quartz",
      "Zeroconf/Bonjour"
    ],
    links: [
      {
        labelTr: "Google Play",
        labelEn: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.ibrahimtemur.macremote",
        type: "live"
      },
      {
        labelTr: "App Store",
        labelEn: "App Store",
        url: "https://apps.apple.com/tr/app/desktop-remote/id6812348430?l=tr",
        type: "live"
      },
      {
        labelTr: "Mac DMG (v1.5.0)",
        labelEn: "Mac DMG (v1.5.0)",
        url: "https://github.com/ibrahimtemur/mac-remote-app/releases/latest",
        type: "live"
      },
      {
        labelTr: "App Store Dev",
        labelEn: "App Store Dev",
        url: "https://apps.apple.com/us/developer/ibrahim-temur/id6812348432",
        type: "live"
      },
      {
        labelTr: "Play Store Dev",
        labelEn: "Play Store Dev",
        url: "https://play.google.com/store/apps/developer?id=%C4%B0brahim+Temur",
        type: "live"
      },
      {
        labelTr: "GitHub",
        labelEn: "GitHub",
        url: "https://github.com/ibrahimtemur/mac-remote-app",
        type: "repo"
      }
    ]
  },
  {
    id: "info-session",
    repoName: "info-session",
    categories: ["web"],
    primaryCategory: "web",
    stars: 1,
    forks: 0,
    language: "JavaScript",
    title: {
      tr: "GDG on Campus · Info Session Masa Eşleştirme Platformu",
      en: "GDG on Campus · Info Session Table-Matching Platform"
    },
    categoryBadge: {
      tr: "Full-Stack Web · Canlı Sistem",
      en: "Full-Stack Web · Live Production"
    },
    description: {
      tr: "GDG on Campus tanışma etkinlikleri için katılımcıların 8 boyutlu özellik vektörünü analiz ederek hem ortak ilgi alanlarına hem de bölüm çeşitliliğine göre masalara yerleştiren algoritmik web uygulaması, canlı Admin ve 1080p Projektör paneli.",
      en: "Mobile-first algorithmic speed-networking platform for GDG on Campus events. Computes 8-dimensional participant vectors with seed dispersion & local swap optimization, featuring a live Admin dashboard and 1080p Projector view."
    },
    tech: [
      "React 19",
      "Vite 8",
      "Tailwind CSS v4",
      "Node.js & Express 5",
      "Neon Serverless Postgres",
      "Material Design 3",
      "Vitest (42 Tests)"
    ],
    links: [
      {
        labelTr: "Canlı Demo (Vercel)",
        labelEn: "Live Demo (Vercel)",
        url: "https://info-session-psi.vercel.app/",
        type: "live"
      },
      {
        labelTr: "Admin Paneli",
        labelEn: "Admin Demo",
        url: "https://info-session-psi.vercel.app/admin",
        type: "repo"
      },
      {
        labelTr: "GitHub",
        labelEn: "GitHub",
        url: "https://github.com/ibrahimtemur/info-session",
        type: "repo"
      }
    ]
  },
  {
    id: "portfoy-app",
    repoName: "portfoy_app",
    categories: ["mobile", "desktop"],
    primaryCategory: "mobile",
    stars: 1,
    forks: 0,
    language: "Dart",
    title: {
      tr: "Canlı Portföyüm — Çoklu Platform Yatırım & Varlık Takibi",
      en: "Live Portfolio — Multi-Platform Asset & Investment Tracker"
    },
    categoryBadge: {
      tr: "Mobil & Masaüstü (Flutter)",
      en: "Mobile & Desktop (Flutter)"
    },
    description: {
      tr: "Flutter ve Dart ile geliştirilen; Borsa İstanbul (BIST), altın ve döviz varlıklarını anlık fiyatlarla takip eden, dinamik pasta grafiklerle kar/zarar analizi, Fintables bilanço takvimi ve gizlilik modu sunan çapraz platform uygulama.",
      en: "Built with Flutter & Dart for Android, iOS, macOS, and Windows. Tracks BIST stocks, gold, and currency assets in real time with interactive pie charts (fl_chart), P&L analytics, earnings calendar integration, and privacy mode."
    },
    tech: [
      "Flutter",
      "Dart",
      "fl_chart",
      "REST API (http)",
      "SharedPreferences",
      "Android · iOS · macOS · Windows"
    ],
    links: [
      {
        labelTr: "GitHub",
        labelEn: "GitHub",
        url: "https://github.com/ibrahimtemur/portfoy_app",
        type: "repo"
      }
    ]
  },
  {
    id: "iot-coffee-controller",
    repoName: null,
    categories: ["iot"],
    primaryCategory: "iot",
    stars: null,
    forks: null,
    language: "C++",
    title: {
      tr: "Akıllı IoT Kahve Makinesi Kontrolcüsü & ADC Sensör Sistemi",
      en: "Smart IoT Coffee Machine Controller & ADC Sensor Pipeline"
    },
    categoryBadge: {
      tr: "IoT & Gömülü Sistemler",
      en: "IoT & Embedded Systems"
    },
    description: {
      tr: "ESP32 ve ESP8266 mikrodenetleyicileri üzerinde çalışan, Wi-Fi üzerinden kahve makinesi demleme/röle durum makinesini kontrol eden gömülü sistem ve 64x aşırı örneklemeli (oversampled) ADC gerilim bölücü direnç ölçüm algoritması.",
      en: "ESP32 & ESP8266 microcontroller firmware providing wireless Wi-Fi relay state-machine control for a coffee machine, paired with a 64-sample oversampled ADC voltage-divider sensor & resistance measurement pipeline."
    },
    tech: [
      "ESP32",
      "ESP8266",
      "Arduino C/C++",
      "Embedded Web Server",
      "Relay State Machine",
      "64x ADC Filtering"
    ],
    links: [
      {
        labelTr: "GitHub Profili",
        labelEn: "GitHub Profile",
        url: "https://github.com/ibrahimtemur",
        type: "repo"
      }
    ]
  },
  {
    id: "university-academic-mvc",
    repoName: null,
    categories: ["web"],
    primaryCategory: "web",
    stars: null,
    forks: null,
    language: "C#",
    title: {
      tr: "Üniversite & Akademik Bilgi Yönetim Sistemi (ASP.NET Core MVC)",
      en: "University & Academic Information System (ASP.NET Core MVC)"
    },
    categoryBadge: {
      tr: "Web Geliştirme · Kurumsal MVC",
      en: "Web Development · Enterprise MVC"
    },
    description: {
      tr: "ASP.NET Core MVC (.NET), Entity Framework Core ve SQL Server ile geliştirilen; öğrenci, akademik danışman, bölüm, ders, transkript, diploma ve yabancı dil kayıtlarını ilişkisel SQL görünümleri (Views) ve denetim loglarıyla yöneten web sistemi.",
      en: "Enterprise web application built with ASP.NET Core MVC, Entity Framework Core, and SQL Server. Manages students, advisors, departments, courses, transcripts, and diplomas using relational SQL Views, audit logs, and Identity auth."
    },
    tech: [
      "C#",
      "ASP.NET Core MVC",
      "Entity Framework Core",
      "SQL Server",
      "ASP.NET Core Identity",
      "Razor Views"
    ],
    links: [
      {
        labelTr: "GitHub Profili",
        labelEn: "GitHub Profile",
        url: "https://github.com/ibrahimtemur",
        type: "repo"
      }
    ]
  },
  {
    id: "music-catalog-mvc",
    repoName: null,
    categories: ["web", "desktop"],
    primaryCategory: "web",
    stars: null,
    forks: null,
    language: "C#",
    title: {
      tr: "Müzik Envanteri, Masaüstü GUI & Otomasyon Araçları",
      en: "Music Inventory MVC, Java Swing GUI & Userscript Tools"
    },
    categoryBadge: {
      tr: "Web & Masaüstü Sistemler",
      en: "Web & Desktop Systems"
    },
    description: {
      tr: "ASP.NET Core MVC ve SQL Server tabanlı sanatçı/albüm/enstrüman yönetim uygulaması, nesne yönelimli Java Swing masaüstü arayüz projeleri ve web iş akışlarını hızlandıran özel Tampermonkey JavaScript betikleri.",
      en: "Collection of engineering tools including an ASP.NET Core MVC music & instrument catalog system, object-oriented Java Swing desktop GUI applications, and custom Tampermonkey JavaScript browser automation userscripts."
    },
    tech: [
      "ASP.NET Core MVC",
      "Java & Java Swing",
      "Tampermonkey JS",
      "SQL Server",
      "C / C++"
    ],
    links: [
      {
        labelTr: "GitHub Profili",
        labelEn: "GitHub Profile",
        url: "https://github.com/ibrahimtemur",
        type: "repo"
      }
    ]
  }
];

/**
 * Returns filtered project list matching a category ('all', 'mobile', 'web', 'desktop', 'iot').
 */
export function getProjects(filter = "all") {
  if (!filter || filter === "all") return PROJECTS_DATA;
  return PROJECTS_DATA.filter(
    (proj) => Array.isArray(proj.categories) && proj.categories.includes(filter)
  );
}

/**
 * Looks up a single project entry by its id.
 */
export function getProjectById(id) {
  return PROJECTS_DATA.find((proj) => proj.id === id) || null;
}
