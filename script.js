/* ==========================================================================
   İBRAHİM TEMUR — PORTFOLIO INTERACTIVE ENGINE (script.js)
   Features:
   - Bilingual i18n Engine (TR / EN) with localStorage persistence
   - Dual Theme Manager (Dark / Light) with prefers-color-scheme & localStorage
   - Dynamic Typewriter Effect synchronized with active language
   - Interactive Featured Project ("Mac Remote") Screenshot Switcher (TR/EN aware)
   - Project Category Filtering + Live GitHub API Repository Sync
   - One-Click Email Copy with Toast Notification & Scroll Reveal Animations
   ========================================================================== */

const GITHUB_USERNAME = "ibrahimtemur";
const EMAIL_ADDRESS = "ibrahimtemur847@gmail.com";

/* --------------------------------------------------------------------------
   1. BILINGUAL DICTIONARY (TR & EN)
   -------------------------------------------------------------------------- */
const I18N = {
  tr: {
    "meta.title": "İbrahim Temur — Yazılım Geliştirici & Bilgisayar Mühendisliği Öğrencisi",
    "nav.role": "Yazılım & Sistem",
    "nav.about": "Hakkımda",
    "nav.skills": "Yetenekler",
    "nav.featured": "Vitrin",
    "nav.projects": "Projeler",
    "nav.contact": "İletişim",

    "hero.badge.gdg": "GDG on Campus ADÜ — Yazılım Core Team Üyesi",
    "hero.badge.store": "Google Play & App Store'da Yayında Ürün Sahibi",
    "hero.greeting": "Merhaba, ben",
    "hero.role": "Bilgisayar Mühendisliği Öğrencisi & Yazılım Geliştirici",
    "hero.profile.sub": "ADÜ Bilgisayar Mühendisliği · GDG Core Team",
    "hero.desc": "Aydın Adnan Menderes Üniversitesi (ADÜ) <strong>Bilgisayar Mühendisliği</strong> öğrencisi ve <strong>GDG on Campus ADÜ Yazılım Core Team</strong> üyesiyim. Donanım seviyesinde sistem programlama ve gerçek zamanlı ekran aktarımından (<strong>macOS, iOS, Android, Flutter</strong>), ölçeklenebilir Full-Stack web mimarilerine (<strong>React 19, ASP.NET Core MVC, PostgreSQL</strong>) ve <strong>ESP32/ESP8266 IoT</strong> çözümlerine kadar uçtan uca ürünler geliştiriyorum.",
    "hero.cta.projects": "Projelerimi İncele",
    "hero.cta.contact": "İletişime Geç",
    "hero.metric.stores": "Mağazada Yayında (iOS, Android, macOS)",
    "hero.metric.domains": "Mühendislik Disiplini (Mobil, Web, Sistem, IoT)",
    "hero.metric.community": "GDG on Campus ADÜ Core Team",

    "about.eyebrow": "Mühendislik & Topluluk",
    "about.title": "Hakkımda ve Odak Alanlarım",
    "about.subtitle": "Düşük gecikmeli yerel sistemlerden bulut tabanlı Full-Stack web uygulamalarına ve gömülü mikrodenetleyici projelerine uzanan çok disiplinli yazılım mühendisliği yaklaşımı.",

    "about.card1.title": "Bilgisayar Mühendisliği & Uçtan Uca Ürün Geliştirme",
    "about.card1.text": "Aydın Adnan Menderes Üniversitesi (ADÜ) <strong>Bilgisayar Mühendisliği</strong> eğitimim boyunca teorik algoritma ve veri yapısı temellerini doğrudan gerçek dünya ürünlerine dönüştürmeye odaklandım. Bir fikri yalnızca prototip aşamasında bırakmayıp; <strong>Apple App Store</strong>, <strong>Google Play Store</strong>, <strong>Apple Notary onaylı macOS DMG</strong> paketleri ve <strong>Vercel Serverless</strong> ortamlarında son kullanıcıya ulaşan canlı sistemler olarak yayınlıyorum.",

    "about.card2.title": "GDG on Campus ADÜ — Yazılım Core Team",
    "about.card2.text": "<strong>Google Developer Groups (GDG) on Campus ADÜ</strong> bünyesinde <strong>Yazılım (Software) Core Team Üyesi</strong> olarak aktif görev alıyorum. Topluluk etkinliklerinde yüzlerce katılımcının ortak ilgi alanlarına göre masalara yerleştirildiği <strong>Info Session Akıllı Masa Eşleştirme Platformu</strong> gibi canlı yazılımlar geliştiriyor ve teknik içerik üretimine katkıda bulunuyorum.",

    "about.card3.title": "Çapraz Platform & Düşük Gecikmeli Ağ Mimarileri",
    "about.card3.text": "<strong>Flutter & Dart</strong>, <strong>SwiftUI (iOS)</strong>, <strong>Jetpack Compose (Android)</strong> ve <strong>Python PyQt6 (macOS)</strong> ile çoklu platform deneyimleri inşa ediyorum. WebSockets, Zeroconf/Bonjour (mDNS), ters TCP tünelleri ve macOS CoreGraphics (Quartz) API'leri ile milisaniye seviyesinde çalışan gerçek zamanlı sistemler tasarlıyorum.",

    "about.card4.title": "Web Sistemleri, Masaüstü & Gömülü IoT",
    "about.card4.text": "Modern web tarafında <strong>React 19</strong>, <strong>Node.js/Express</strong> ve kurumsal <strong>ASP.NET Core MVC (Entity Framework Core, SQL Server)</strong> mimarileri; donanım tarafında ise <strong>ESP32 / ESP8266</strong> mikrodenetleyicileriyle Wi-Fi tabanlı <strong>IoT Kahve Makinesi Kontrolü</strong> ve hassas ADC sensör okuma devreleri geliştiriyorum."
  },
  en: {
    "meta.title": "İbrahim Temur — Software Developer & Computer Engineering Student",
    "nav.role": "Software & Systems",
    "nav.about": "About",
    "nav.skills": "Tech Stack",
    "nav.featured": "Spotlight",
    "nav.projects": "Projects",
    "nav.contact": "Contact",

    "hero.badge.gdg": "GDG on Campus ADÜ — Software Core Team Member",
    "hero.badge.store": "Published on Google Play & Apple App Store",
    "hero.greeting": "Hi, I'm",
    "hero.role": "Computer Engineering Student & Software Developer",
    "hero.profile.sub": "ADÜ Computer Engineering · GDG Core Team",
    "hero.desc": "<strong>Computer Engineering</strong> student at Aydın Adnan Menderes University (ADÜ) and <strong>GDG on Campus ADÜ Software Core Team</strong> member. I engineer end-to-end products spanning hardware-level system programming and real-time screen streaming (<strong>macOS, iOS, Android, Flutter</strong>), scalable Full-Stack web architectures (<strong>React 19, ASP.NET Core MVC, PostgreSQL</strong>), and <strong>ESP32/ESP8266 IoT</strong> hardware solutions.",
    "hero.cta.projects": "Explore Projects",
    "hero.cta.contact": "Get in Touch",
    "hero.metric.stores": "Live on App Store, Google Play & macOS",
    "hero.metric.domains": "Core Domains (Mobile, Web, Systems, IoT)",
    "hero.metric.community": "GDG on Campus ADÜ Core Team",

    "about.eyebrow": "Engineering & Community",
    "about.title": "About Me & Core Focus",
    "about.subtitle": "A multi-disciplinary software engineering mindset bridging ultra-low-latency native apps, cloud-native Full-Stack web systems, and embedded microcontroller hardware.",

    "about.card1.title": "Computer Engineering & End-to-End Product Delivery",
    "about.card1.text": "Throughout my <strong>Computer Engineering</strong> studies at Aydın Adnan Menderes University (ADÜ), I have focused on turning algorithmic foundations into production software. Rather than stopping at prototypes, I ship signed, production-grade software to the <strong>Apple App Store</strong>, <strong>Google Play Store</strong>, <strong>Apple Notarized macOS DMG</strong> releases, and <strong>Vercel Serverless</strong> infrastructure.",

    "about.card2.title": "GDG on Campus ADÜ — Software Core Team",
    "about.card2.text": "Active <strong>Software Core Team Member</strong> at <strong>Google Developer Groups (GDG) on Campus ADÜ</strong>. I build real-world software for community events—such as the live <strong>Info Session Algorithmic Table-Matching Platform</strong>—and contribute to developer workshops and technical initiatives.",

    "about.card3.title": "Cross-Platform & Low-Latency Network Systems",
    "about.card3.text": "Experienced in building native and cross-platform experiences with <strong>Flutter & Dart</strong>, <strong>SwiftUI (iOS)</strong>, <strong>Jetpack Compose (Android)</strong>, and <strong>Python PyQt6 (macOS)</strong>. Specialized in WebSockets, Zeroconf/Bonjour (mDNS), reverse TCP tunnels, and macOS CoreGraphics (Quartz) synthetic input injection.",

    "about.card4.title": "Full-Stack Web, Desktop & Embedded IoT",
    "about.card4.text": "Developing modern web applications with <strong>React 19</strong>, <strong>Node.js/Express</strong>, and enterprise <strong>ASP.NET Core MVC (EF Core, SQL Server)</strong>; alongside embedded <strong>ESP32 / ESP8266</strong> hardware systems including a smart Wi-Fi <strong>IoT Coffee Machine Controller</strong> and oversampled ADC sensor pipelines."
  }
};

/* Extend I18N with Tech Stack, Featured Spotlight, Projects, and Contact keys */
Object.assign(I18N.tr, {
  "skills.eyebrow": "Teknoloji Yığını",
  "skills.title": "Kullandığım Diller, Frameworkler ve Araçlar",
  "skills.subtitle": "Mobil, Web, Masaüstü/Sistem ve Gömülü IoT projelerinde aktif olarak üretimde kullandığım teknolojiler.",
  "skills.cat1.title": "Programlama Dilleri",
  "skills.cat1.desc": "Nesne yönelimli, sistem düzeyi ve modern uygulama dilleri",
  "skills.cat2.title": "Frameworkler & Teknolojiler",
  "skills.cat2.desc": "Çapraz platform mobil, modern web, masaüstü GUI ve otomasyon",
  "skills.cat3.title": "Veritabanı, Ağ & DevOps",
  "skills.cat3.desc": "İlişkisel veritabanları, gerçek zamanlı protokoller ve bulut dağıtımı",
  "skills.cat4.title": "Donanım & Gömülü IoT",
  "skills.cat4.desc": "Mikrodenetleyici programlama, sensör/röle kontrolü ve sinyal işleme",
  "skills.iot.coffee": "IoT Kahve Makinesi Kontrolü",
  "skills.iot.adc": "64x Örneklemeli ADC Sensör & Direnç Ölçümü",
  "skills.iot.relay": "Wi-Fi Röle & Durum Makinesi Otomasyonu",

  "featured.eyebrow": "Vitrin Projesi · Mağazalarda Yayında",
  "featured.title": "Öne Çıkan Ürün: Mac Remote (Desktop Remote)",
  "featured.subtitle": "iOS (iPhone & iPad) ve Android cihazları macOS için ultra düşük gecikmeli kablosuz trackpad, klavye, medya kumandası ve 2200p canlı ekran yansıtıcısına dönüştüren çapraz platform ekosistem.",
  "featured.badge.live": "Google Play & App Store'da Yayında",
  "featured.badge.notarized": "Apple Developer ID İmzalı & Notarized DMG",
  "featured.card.tagline": "iOS, Android ve macOS Arasında Milisaniye Seviyesinde Kablosuz Kontrol & Ekran Aktarımı",
  "featured.card.desc": "Mac Remote; yerel Wi-Fi (Zeroconf/Bonjour mDNS) veya internet (Oracle Cloud VPS üzerinde izole ters TCP tüneli + QR kod eşleştirme) üzerinden çalışan, donanım düzeyinde macOS CoreGraphics (Quartz) girdi enjeksiyonuna ve GPU hızlandırmalı canlı ekran yansıtmasına sahip uçtan uca bir üründür.",
  "featured.hl1": "Alt piksel hassasiyetinde macOS CoreGraphics (Quartz) çoklu dokunma trackpad ve sürükle-bırak emülasyonu",
  "featured.hl2": "800p Akıcı moddan 2200p Ultra HD kademesine kadar gerçek zamanlı JPEG ekran akışı ve sıkıştırma kontrolü",
  "featured.hl3": "Zeroconf / Bonjour (_macremote._tcp) ile sıfır ayarlı LAN keşfi ve ters TCP tüneli ile WAN uzaktan erişim",
  "featured.hl4": "Dinamik 4 haneli PIN doğrulaması, yerel SwiftUI (iOS), Jetpack Compose (Android) ve PyQt6 (macOS) istemcileri",
  "featured.btn.play.sub": "ANDROID İSTEMCİSİ",
  "featured.btn.play.main": "Google Play'den İndir",
  "featured.btn.ios.sub": "iOS & iPadOS İSTEMCİSİ",
  "featured.btn.ios.main": "App Store'dan İndir",
  "featured.btn.dmg.sub": "macOS SUNUCU (v1.5.0)",
  "featured.btn.dmg.main": "Mac DMG İndir",
  "featured.btn.repo": "GitHub Kaynak Kodu",
  "featured.tab1": "1. Cihaz Keşfi & Bağlantı",
  "featured.tab2": "2. Trackpad & Canlı Ekran",
  "featured.tab3": "3. macOS Sunucu Paneli",

  "projects.eyebrow": "Açık Kaynak & Mühendislik Portföyü",
  "projects.title": "Projelerim ve Geliştirdiğim Sistemler",
  "projects.subtitle": "Mobil uygulamalardan algoritmik Full-Stack web platformlarına, kurumsal ASP.NET Core MVC sistemlerinden ESP32/ESP8266 IoT donanım projelerine kadar tüm çalışmalarım.",
  "filter.all": "Tümü",
  "filter.mobile": "Mobil (Flutter & Native)",
  "filter.web": "Web Geliştirme",
  "filter.desktop": "Masaüstü & Sistem",
  "filter.iot": "IoT & Gömülü Sistemler",
  "github.syncing": "GitHub API ile senkronize ediliyor...",
  "github.synced": "GitHub API ile canlı senkronize (@ibrahimtemur)",
  "github.fallback": "Yerel proje veritabanı aktif (@ibrahimtemur)",

  "contact.eyebrow": "İletişim & İş Birliği",
  "contact.title": "Birlikte Yeni Bir Ürün Geliştirelim",
  "contact.subtitle": "Yazılım mühendisliği fırsatları, açık kaynak projeler, GDG topluluk etkinlikleri veya teknik iş birlikleri için benimle doğrudan iletişime geçebilirsiniz.",
  "contact.copy": "E-postayı Kopyala",
  "contact.copied": "Kopyalandı!",
  "contact.send": "E-posta Gönder",
  "toast.copied": "E-posta adresi panoya kopyalandı: ibrahimtemur847@gmail.com",
  "footer.rights": "© 2026 İbrahim Temur. Tüm hakları saklıdır.",
  "footer.built": "GitHub Pages için modern HTML5, CSS3 ve Vanilla JS ile tasarlandı."
});

Object.assign(I18N.en, {
  "skills.eyebrow": "Technology Stack",
  "skills.title": "Languages, Frameworks & Engineering Tools",
  "skills.subtitle": "Production technologies I actively use across Mobile, Full-Stack Web, Desktop/Systems, and Embedded IoT projects.",
  "skills.cat1.title": "Programming Languages",
  "skills.cat1.desc": "Object-oriented, systems-level, and modern application languages",
  "skills.cat2.title": "Frameworks & Technologies",
  "skills.cat2.desc": "Cross-platform mobile, modern web, desktop GUI, and browser automation",
  "skills.cat3.title": "Database, Network & DevOps",
  "skills.cat3.desc": "Relational databases, real-time protocols, and cloud deployment",
  "skills.cat4.title": "Hardware & Embedded IoT",
  "skills.cat4.desc": "Microcontroller firmware, sensor/relay automation, and signal processing",
  "skills.iot.coffee": "IoT Smart Coffee Machine Controller",
  "skills.iot.adc": "64x Oversampled ADC Sensor & Resistance Metering",
  "skills.iot.relay": "Wi-Fi Relay & State Machine Automation",

  "featured.eyebrow": "Featured Spotlight · Live on App Stores",
  "featured.title": "Flagship Product: Mac Remote (Desktop Remote)",
  "featured.subtitle": "An ultra-low-latency cross-platform ecosystem transforming iOS (iPhone & iPad) and Android devices into a wireless trackpad, keyboard, media controller, and 2200p live screen mirror for macOS.",
  "featured.badge.live": "Published on Google Play & App Store",
  "featured.badge.notarized": "Apple Developer ID Signed & Notarized DMG",
  "featured.card.tagline": "Sub-Millisecond Wireless Control & Real-Time Screen Streaming Across iOS, Android & macOS",
  "featured.card.desc": "Mac Remote operates seamlessly over local Wi-Fi (Zeroconf/Bonjour mDNS) or the internet (isolated reverse TCP tunnel on Oracle Cloud VPS + QR code pairing), combining hardware-level macOS CoreGraphics (Quartz) input injection with GPU-accelerated live screen streaming.",
  "featured.hl1": "Sub-pixel macOS CoreGraphics (Quartz) multi-touch trackpad, right-click, 2-finger scroll & drag-select",
  "featured.hl2": "Real-time JPEG screen streaming from 800p Smooth mode up to 2200p Ultra HD with dynamic quality control",
  "featured.hl3": "Zero-config LAN discovery via Zeroconf/Bonjour (_macremote._tcp) & WAN remote access via reverse TCP tunnel",
  "featured.hl4": "Dynamic 4-digit PIN security with native SwiftUI (iOS), Jetpack Compose (Android) & PyQt6 (macOS) apps",
  "featured.btn.play.sub": "ANDROID CLIENT",
  "featured.btn.play.main": "Get it on Google Play",
  "featured.btn.ios.sub": "iOS & iPadOS CLIENT",
  "featured.btn.ios.main": "Download on App Store",
  "featured.btn.dmg.sub": "macOS SERVER (v1.5.0)",
  "featured.btn.dmg.main": "Download Mac DMG",
  "featured.btn.repo": "GitHub Source Code",
  "featured.tab1": "1. Discovery & Connection",
  "featured.tab2": "2. Trackpad & Live Screen",
  "featured.tab3": "3. macOS Server Control Panel",

  "projects.eyebrow": "Open Source & Engineering Portfolio",
  "projects.title": "Projects & Engineered Systems",
  "projects.subtitle": "Explore my work across cross-platform mobile apps, algorithmic Full-Stack web platforms, enterprise ASP.NET Core MVC systems, and ESP32/ESP8266 IoT hardware.",
  "filter.all": "All Projects",
  "filter.mobile": "Mobile (Flutter & Native)",
  "filter.web": "Web Development",
  "filter.desktop": "Desktop & Systems",
  "filter.iot": "IoT & Embedded",
  "github.syncing": "Syncing with GitHub API...",
  "github.synced": "Live synced with GitHub API (@ibrahimtemur)",
  "github.fallback": "Curated repository dataset active (@ibrahimtemur)",

  "contact.eyebrow": "Contact & Collaboration",
  "contact.title": "Let's Build Something Exceptional",
  "contact.subtitle": "Feel free to reach out for software engineering opportunities, open-source collaborations, GDG community events, or technical discussions.",
  "contact.copy": "Copy Email",
  "contact.copied": "Copied!",
  "contact.send": "Send Email",
  "toast.copied": "Email copied to clipboard: ibrahimtemur847@gmail.com",
  "footer.rights": "© 2026 İbrahim Temur. All rights reserved.",
  "footer.built": "Engineered for GitHub Pages with semantic HTML5, CSS3 & Vanilla JS."
});

/* --------------------------------------------------------------------------
   2. TYPEWRITER PHRASES & FEATURED SCREENSHOTS (TR / EN)
   -------------------------------------------------------------------------- */
const TYPEWRITER_PHRASES = {
  tr: [
    "Flutter & Çapraz Platform Uygulamalar (iOS, Android, macOS, Windows)",
    "Native Mobil & Masaüstü (SwiftUI, Jetpack Compose, Python PyQt6)",
    "Full-Stack Web Mimarileri (React 19, ASP.NET Core MVC, Node.js)",
    "Düşük Gecikmeli Ağ & Sistem Programlama (WebSockets, CoreGraphics)",
    "IoT & Gömülü Sistem Çözümleri (ESP32, ESP8266, Arduino C/C++)"
  ],
  en: [
    "Flutter & Cross-Platform Apps (iOS, Android, macOS, Windows)",
    "Native Mobile & Desktop (SwiftUI, Jetpack Compose, Python PyQt6)",
    "Full-Stack Web Architectures (React 19, ASP.NET Core MVC, Node.js)",
    "Low-Latency Networking & Systems (WebSockets, CoreGraphics Quartz)",
    "IoT & Embedded Hardware Solutions (ESP32, ESP8266, Arduino C/C++)"
  ]
};

const FEATURED_SCREENS = {
  tr: [
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/tr1.png",
      caption: "Zeroconf/Bonjour otomatik Mac keşfi, QR kod ile WAN eşleştirme ve 4 haneli PIN girişi"
    },
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/tr2.png",
      caption: "Donanım düzeyinde çoklu dokunma Trackpad, canlı ekran yansıtma ve dinamik çözünürlük (800p–2200p)"
    },
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/mac_server_tr.png",
      caption: "macOS PyQt6 Sunucu Kontrol Paneli: Dinamik PIN, LAN IP, WAN tünel adresi ve QR kod"
    }
  ],
  en: [
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/en1.png",
      caption: "Zeroconf/Bonjour automatic Mac discovery, WAN QR code pairing, and 4-digit PIN authentication"
    },
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/en2.png",
      caption: "Hardware-level multi-touch Trackpad, live screen mirror & dynamic resolution switcher (800p–2200p)"
    },
    {
      src: "https://raw.githubusercontent.com/ibrahimtemur/mac-remote-app/main/screenshots/mac_server_en.png",
      caption: "macOS PyQt6 Server Control Panel: Dynamic 4-digit PIN, LAN IP, WAN tunnel address & QR code"
    }
  ]
};

/* --------------------------------------------------------------------------
   3. AUTHENTIC PROJECTS CATALOG (SYNCED WITH GITHUB API)
   -------------------------------------------------------------------------- */
const PROJECTS_DATA = [
  {
    id: "mac-remote-app",
    repoName: "mac-remote-app",
    categories: ["mobile", "desktop"],
    primaryCategory: "mobile",
    stars: 2,
    forks: 0,
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
    tech: ["Python & PyQt6", "SwiftUI (iOS)", "Kotlin & Compose", "WebSockets", "CoreGraphics Quartz", "Zeroconf/Bonjour"],
    links: [
      { labelTr: "Google Play", labelEn: "Google Play", url: "https://play.google.com/store/apps/details?id=com.ibrahimtemur.macremote", type: "live" },
      { labelTr: "App Store", labelEn: "App Store", url: "https://apps.apple.com/tr/app/desktop-remote/id6812348430?l=tr", type: "live" },
      { labelTr: "GitHub", labelEn: "GitHub", url: "https://github.com/ibrahimtemur/mac-remote-app", type: "repo" }
    ]
  },
  {
    id: "info-session",
    repoName: "info-session",
    categories: ["web"],
    primaryCategory: "web",
    stars: 1,
    forks: 0,
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
    tech: ["React 19", "Vite 8", "Tailwind CSS v4", "Node.js & Express 5", "Neon Serverless Postgres", "Material Design 3", "Vitest (42 Tests)"],
    links: [
      { labelTr: "Canlı Demo (Vercel)", labelEn: "Live Demo (Vercel)", url: "https://info-session-psi.vercel.app/", type: "live" },
      { labelTr: "Admin Paneli", labelEn: "Admin Demo", url: "https://info-session-psi.vercel.app/admin", type: "repo" },
      { labelTr: "GitHub", labelEn: "GitHub", url: "https://github.com/ibrahimtemur/info-session", type: "repo" }
    ]
  },
  {
    id: "portfoy-app",
    repoName: "portfoy_app",
    categories: ["mobile", "desktop"],
    primaryCategory: "mobile",
    stars: 1,
    forks: 0,
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
    tech: ["Flutter", "Dart", "fl_chart", "REST API (http)", "SharedPreferences", "Android · iOS · macOS · Windows"],
    links: [
      { labelTr: "GitHub", labelEn: "GitHub", url: "https://github.com/ibrahimtemur/portfoy_app", type: "repo" }
    ]
  },
  {
    id: "iot-coffee-controller",
    repoName: null,
    categories: ["iot"],
    primaryCategory: "iot",
    stars: null,
    forks: null,
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
    tech: ["ESP32", "ESP8266", "Arduino C/C++", "Embedded Web Server", "Relay State Machine", "64x ADC Filtering"],
    links: [
      { labelTr: "GitHub Profili", labelEn: "GitHub Profile", url: "https://github.com/ibrahimtemur", type: "repo" }
    ]
  },
  {
    id: "university-academic-mvc",
    repoName: null,
    categories: ["web"],
    primaryCategory: "web",
    stars: null,
    forks: null,
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
    tech: ["C#", "ASP.NET Core MVC", "Entity Framework Core", "SQL Server", "ASP.NET Core Identity", "Razor Views"],
    links: [
      { labelTr: "GitHub Profili", labelEn: "GitHub Profile", url: "https://github.com/ibrahimtemur", type: "repo" }
    ]
  },
  {
    id: "music-catalog-mvc",
    repoName: null,
    categories: ["web", "desktop"],
    primaryCategory: "web",
    stars: null,
    forks: null,
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
    tech: ["ASP.NET Core MVC", "Java & Java Swing", "Tampermonkey JS", "SQL Server", "C / C++"],
    links: [
      { labelTr: "GitHub Profili", labelEn: "GitHub Profile", url: "https://github.com/ibrahimtemur", type: "repo" }
    ]
  }
];

/* --------------------------------------------------------------------------
   4. APPLICATION STATE & INITIALIZATION
   -------------------------------------------------------------------------- */
let currentLang = localStorage.getItem("portfolio_lang") || "tr";
let currentTheme =
  localStorage.getItem("portfolio_theme") ||
  (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
let currentFilter = "all";
let currentScreenIdx = 0;
let githubSyncedState = "syncing"; // 'syncing' | 'synced' | 'fallback'

/* Typewriter State */
let twPhraseIdx = 0;
let twCharIdx = 0;
let twDeleting = false;
let twTimer = null;

function refreshLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

/* --------------------------------------------------------------------------
   5. THEME MANAGER (DARK / LIGHT)
   -------------------------------------------------------------------------- */
function applyTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  localStorage.setItem("portfolio_theme", currentTheme);

  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    const nextIcon = currentTheme === "dark" ? "sun" : "moon";
    themeToggleBtn.innerHTML = `<i data-lucide="${nextIcon}" id="themeIcon"></i>`;
    refreshLucideIcons();
  }
}

/* --------------------------------------------------------------------------
   6. BILINGUAL (TR / EN) MANAGER
   -------------------------------------------------------------------------- */
function applyLanguage(lang) {
  currentLang = lang === "en" ? "en" : "tr";
  localStorage.setItem("portfolio_lang", currentLang);
  document.documentElement.setAttribute("lang", currentLang);

  const dict = I18N[currentLang];
  if (dict["meta.title"]) {
    document.title = dict["meta.title"];
  }

  // Update language toggle buttons
  const trBtn = document.getElementById("langTrBtn");
  const enBtn = document.getElementById("langEnBtn");
  if (trBtn && enBtn) {
    trBtn.classList.toggle("active", currentLang === "tr");
    enBtn.classList.toggle("active", currentLang === "en");
  }

  // Translate all elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Update GitHub Sync Status badge text according to state
  updateGitHubStatusLabel();

  // Update Featured Project Screenshot & Caption for active language
  updateFeaturedScreen(currentScreenIdx);

  // Re-render project cards in active language
  renderProjects();

  // Reset typewriter smoothly in active language
  resetTypewriter();
}

function updateGitHubStatusLabel() {
  const statusEl = document.getElementById("githubSyncText");
  if (!statusEl) return;
  const dict = I18N[currentLang];
  if (githubSyncedState === "synced") {
    statusEl.textContent = dict["github.synced"];
  } else if (githubSyncedState === "fallback") {
    statusEl.textContent = dict["github.fallback"];
  } else {
    statusEl.textContent = dict["github.syncing"];
  }
}

/* --------------------------------------------------------------------------
   7. DYNAMIC TYPEWRITER EFFECT
   -------------------------------------------------------------------------- */
function resetTypewriter() {
  if (twTimer) clearTimeout(twTimer);
  twPhraseIdx = 0;
  twCharIdx = 0;
  twDeleting = false;
  tickTypewriter();
}

function tickTypewriter() {
  const textEl = document.getElementById("typewriterText");
  if (!textEl) return;

  const phrases = TYPEWRITER_PHRASES[currentLang] || TYPEWRITER_PHRASES.tr;
  const currentPhrase = phrases[twPhraseIdx % phrases.length];

  if (!twDeleting) {
    twCharIdx++;
    textEl.textContent = currentPhrase.slice(0, twCharIdx);
    if (twCharIdx >= currentPhrase.length) {
      twDeleting = true;
      twTimer = setTimeout(tickTypewriter, 2100);
      return;
    }
    twTimer = setTimeout(tickTypewriter, 42);
  } else {
    twCharIdx--;
    textEl.textContent = currentPhrase.slice(0, twCharIdx);
    if (twCharIdx <= 0) {
      twDeleting = false;
      twPhraseIdx = (twPhraseIdx + 1) % phrases.length;
      twTimer = setTimeout(tickTypewriter, 320);
      return;
    }
    twTimer = setTimeout(tickTypewriter, 22);
  }
}

/* --------------------------------------------------------------------------
   8. FEATURED SPOTLIGHT SCREENSHOT SWITCHER (MAC REMOTE)
   -------------------------------------------------------------------------- */
function updateFeaturedScreen(idx) {
  const screens = FEATURED_SCREENS[currentLang] || FEATURED_SCREENS.tr;
  currentScreenIdx = Math.max(0, Math.min(idx, screens.length - 1));
  const item = screens[currentScreenIdx];

  const imgEl = document.getElementById("featuredPreviewImg");
  const capEl = document.getElementById("featuredPreviewCaption");

  if (imgEl && item) {
    imgEl.style.opacity = "0.35";
    setTimeout(() => {
      imgEl.src = item.src;
      imgEl.style.opacity = "1";
    }, 120);
  }
  if (capEl && item) {
    capEl.textContent = item.caption;
  }

  document.querySelectorAll(".preview-tab").forEach((btn) => {
    const bIdx = Number(btn.getAttribute("data-screen-idx"));
    btn.classList.toggle("active", bIdx === currentScreenIdx);
  });
}

/* --------------------------------------------------------------------------
   9. PROJECTS RENDERER & CATEGORY FILTER
   -------------------------------------------------------------------------- */
function getCategoryBadgeClass(cat) {
  if (cat === "web") return "cat-web";
  if (cat === "desktop") return "cat-desktop";
  if (cat === "iot") return "cat-iot";
  return "";
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  const filtered = PROJECTS_DATA.filter((proj) => {
    if (currentFilter === "all") return true;
    return Array.isArray(proj.categories) && proj.categories.includes(currentFilter);
  });

  grid.innerHTML = filtered
    .map((proj) => {
      const title = proj.title[currentLang] || proj.title.tr;
      const desc = proj.description[currentLang] || proj.description.tr;
      const badge = proj.categoryBadge[currentLang] || proj.categoryBadge.tr;
      const badgeClass = getCategoryBadgeClass(proj.primaryCategory);

      const statsHtml =
        proj.stars !== null
          ? `<div class="project-stats">
               <span class="project-stat" title="GitHub Stars">★ ${proj.stars}</span>
               ${proj.forks ? `<span class="project-stat" title="Forks">⑂ ${proj.forks}</span>` : ""}
             </div>`
          : `<div class="project-stats"><span class="project-stat">● Production</span></div>`;

      const techHtml = proj.tech
        .map((t) => `<span class="project-tech-tag">${t}</span>`)
        .join("");

      const linksHtml = proj.links
        .map((lnk) => {
          const label = currentLang === "en" ? lnk.labelEn : lnk.labelTr;
          const isLive = lnk.type === "live";
          const iconMarkup = isLive
            ? `<i data-lucide="external-link" style="width:15px;height:15px;"></i>`
            : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`;
          return `<a href="${lnk.url}" target="_blank" rel="noopener noreferrer" class="project-link-btn ${
            isLive ? "live-demo" : ""
          }">
            ${iconMarkup}
            <span>${label}</span>
          </a>`;
        })
        .join("");

      return `
        <article class="project-card reveal visible">
          <div>
            <div class="project-card-top">
              <span class="project-category-badge ${badgeClass}">${badge}</span>
              ${statsHtml}
            </div>
            <h3 class="project-title">${title}</h3>
            <p class="project-desc">${desc}</p>
            <div class="project-tech-list">${techHtml}</div>
          </div>
          <div class="project-links">${linksHtml}</div>
        </article>
      `;
    })
    .join("");

  refreshLucideIcons();
}

/* --------------------------------------------------------------------------
   10. LIVE GITHUB API SYNCHRONIZATION
   -------------------------------------------------------------------------- */
async function syncWithGitHubApi() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`,
      { headers: { Accept: "application/vnd.github.v3+json" } }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const repos = await response.json();

    if (Array.isArray(repos)) {
      const knownRepos = new Set(
        PROJECTS_DATA.map((p) => (p.repoName ? p.repoName.toLowerCase() : null)).filter(Boolean)
      );
      // Exclude profile readme or github.io repo from auto-appending as duplicate project cards
      knownRepos.add(GITHUB_USERNAME.toLowerCase());
      knownRepos.add(`${GITHUB_USERNAME.toLowerCase()}.github.io`);

      repos.forEach((repo) => {
        if (!repo || !repo.name) return;
        const lowerName = repo.name.toLowerCase();

        // Update stars & forks on curated projects
        const match = PROJECTS_DATA.find(
          (p) => p.repoName && p.repoName.toLowerCase() === lowerName
        );
        if (match) {
          match.stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : match.stars;
          match.forks = typeof repo.forks_count === "number" ? repo.forks_count : match.forks;
          return;
        }

        // Automatically surface any newly created public repository on GitHub
        if (!knownRepos.has(lowerName) && !repo.fork) {
          knownRepos.add(lowerName);
          const langTag = repo.language || "Software";
          const inferredCat =
            ["Dart", "Swift", "Kotlin"].includes(repo.language)
              ? "mobile"
              : ["C", "C++"].includes(repo.language)
              ? "iot"
              : ["Python", "Java"].includes(repo.language)
              ? "desktop"
              : "web";

          PROJECTS_DATA.push({
            id: `gh-${repo.name}`,
            repoName: repo.name,
            categories: [inferredCat],
            primaryCategory: inferredCat,
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            title: {
              tr: repo.name,
              en: repo.name
            },
            categoryBadge: {
              tr: `GitHub Repo · ${langTag}`,
              en: `GitHub Repo · ${langTag}`
            },
            description: {
              tr: repo.description || "GitHub üzerinde yayınlanan açık kaynak yazılım projesi.",
              en: repo.description || "Open-source software project published on GitHub."
            },
            tech: [langTag, "Git", "Open Source"],
            links: [
              ...(repo.homepage
                ? [{ labelTr: "Canlı Demo", labelEn: "Live Demo", url: repo.homepage, type: "live" }]
                : []),
              { labelTr: "GitHub", labelEn: "GitHub", url: repo.html_url, type: "repo" }
            ]
          });
        }
      });

      githubSyncedState = "synced";
      updateGitHubStatusLabel();
      renderProjects();
    }
  } catch (err) {
    githubSyncedState = "fallback";
    updateGitHubStatusLabel();
  }
}

/* --------------------------------------------------------------------------
   11. CLIPBOARD COPY & INTERACTIVE LISTENERS
   -------------------------------------------------------------------------- */
function showToast(message) {
  const toast = document.getElementById("toastNotification");
  const toastText = document.getElementById("toastText");
  if (!toast || !toastText) return;

  toastText.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Theme & Language
  applyTheme(currentTheme);
  applyLanguage(currentLang);

  // Theme Toggle Event
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      applyTheme(currentTheme === "dark" ? "light" : "dark");
    });
  }

  // Language Switcher Events
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLang = btn.getAttribute("data-lang");
      if (targetLang && targetLang !== currentLang) {
        applyLanguage(targetLang);
      }
    });
  });

  // Featured Screenshot Tabs
  document.querySelectorAll(".preview-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const idx = Number(tab.getAttribute("data-screen-idx") || "0");
      updateFeaturedScreen(idx);
    });
  });

  // Project Filter Buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter") || "all";
      renderProjects();
    });
  });

  // One-Click Email Copy
  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
      } catch (_) {
        const temp = document.createElement("textarea");
        temp.value = EMAIL_ADDRESS;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
      }
      const dict = I18N[currentLang];
      const btnText = document.getElementById("copyEmailBtnText");
      if (btnText) {
        btnText.textContent = dict["contact.copied"];
        setTimeout(() => {
          btnText.textContent = I18N[currentLang]["contact.copy"];
        }, 2200);
      }
      showToast(dict["toast.copied"]);
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Navbar Scroll Shadow
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (!navbar) return;
    navbar.classList.toggle("scrolled", window.scrollY > 20);
  });

  // IntersectionObserver for Reveal Animations
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // Sync live repository stats from GitHub API
  syncWithGitHubApi();
});
