// Content for /best-laptops-for-coding. Every spec below is copied from the ASUS India
// tech-spec sheet for that exact configuration (the model code), checked on
// SPECS_CHECKED_ON. Do not add a spec, price or claim that is not on that sheet or
// otherwise verified; update SPECS_CHECKED_ON whenever the data is re-checked.

export const PAGE_PATH = '/best-laptops-for-coding'
// First publication date. Never change it; re-checks only move SPECS_CHECKED_ON.
export const PUBLISHED_ON = '2026-10-10'
export const SPECS_CHECKED_ON = '2026-10-10'

// Admitad deep link for the ASUS India programme. Links go straight to the network,
// never through our own server.
export const AFFILIATE_BASE = 'https://tjzuh.com/g/9d2vnaf4jq0698d2db0503be1d2ce2/?ulp='
export const affiliateUrl = (productUrl) => AFFILIATE_BASE + encodeURIComponent(productUrl)
export const AFFILIATE_REL = 'sponsored nofollow noopener'

// priceBand: { min, max, checkedOn } in rupees, shown only when filled in from the
// ASUS eShop on a known date. Left null when no verified price is available.
export const LAPTOPS = [
  {
    id: 'vivobook-s14-s3407va',
    name: 'ASUS Vivobook S14',
    modelCode: 'S3407VA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-s14-s3407/',
    bestFor: 'Best all-rounder for students',
    summary: 'A light 14-inch laptop with an 8-core Intel H-series processor, 16GB of DDR5 and a fast PCIe 4.0 SSD. Half of the memory sits in a normal SO-DIMM slot, so it is one of the few thin laptops here whose RAM you can still upgrade.',
    specs: {
      processor: 'Intel Core i5-13420H (8 cores, 12 threads, up to 4.6 GHz)',
      graphics: 'Intel UHD Graphics (integrated)',
      memory: '16GB DDR5 (8GB on board + 8GB SO-DIMM)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '14-inch FHD+ (1920 x 1200) 16:10, 60Hz, 300 nits, anti-glare',
      battery: '70Wh',
      weight: '1.40 kg',
      ports: '2x USB-C 3.2 Gen 1 (display + charging), 2x USB-A 3.2 Gen 1, HDMI 1.4, audio jack',
      charging: '65W USB-C adapter',
    },
    pros: [
      'RAM can be upgraded later by replacing the 8GB SO-DIMM module.',
      'H-series processor with 8 cores handles compiles, builds and a local database comfortably.',
      'Large 70Wh battery for a 1.40 kg laptop; charges over USB-C.',
    ],
    cons: [
      'HDMI 1.4 limits an external 4K monitor to 30Hz; use a USB-C monitor or 1080p/1440p screen instead.',
      'Integrated Intel UHD graphics: fine for development, not for CUDA or GPU-heavy work.',
    ],
    priceBand: null,
  },
  {
    id: 'vivobook-s-15-oled-s5504va',
    name: 'ASUS Vivobook S 15 OLED',
    modelCode: 'S5504VA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-s-15-oled-s5504/',
    bestFor: 'Most cores for heavier builds',
    summary: 'A 15.6-inch laptop built around a 12-core, 16-thread Intel Core i5-13500H, the most cores of any laptop in this list. It also has a 2.8K 120Hz OLED screen, a 75Wh battery and a Thunderbolt 4 port for docking.',
    specs: {
      processor: 'Intel Core i5-13500H (12 cores, 16 threads, up to 4.7 GHz)',
      graphics: 'Intel Iris Xe Graphics (integrated)',
      memory: '16GB LPDDR5 on board (not upgradeable)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '15.6-inch 2.8K (2880 x 1620) OLED 16:9, 120Hz, 600 nits peak, glossy',
      battery: '75Wh',
      weight: '1.60 kg',
      ports: '1x Thunderbolt 4, 1x USB-A 3.2 Gen 1, 1x USB-A 2.0, HDMI 1.4, audio jack',
      charging: '90W barrel adapter',
    },
    pros: [
      '12 cores and 16 threads speed up parallel work such as Gradle/Maven builds, test suites and container builds.',
      'Sharp 2.8K 120Hz OLED screen with room for an editor and a terminal side by side.',
      'Thunderbolt 4 port for a dock or a high-resolution monitor over one cable.',
    ],
    cons: [
      'RAM is soldered, so 16GB is permanent.',
      'Glossy 16:9 screen shows fewer lines of code than the 16:10 models and can reflect bright lights.',
      'Separate 90W barrel charger, and HDMI 1.4 limits a 4K monitor to 30Hz.',
    ],
    priceBand: null,
  },
  {
    id: 'vivobook-s-14-oled-s5406sa',
    name: 'ASUS Vivobook S 14 OLED',
    modelCode: 'S5406SA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-s-14-oled-s5406/',
    bestFor: 'Best for multiple monitors and docks',
    summary: 'A slim 1.30 kg laptop with an Intel Core Ultra 7 256V, an OLED screen and two Thunderbolt 4 ports, which makes it the easiest model here to dock to one or two external monitors at a desk.',
    specs: {
      processor: 'Intel Core Ultra 7 256V (8 cores, 8 threads, up to 4.8 GHz)',
      graphics: 'Intel Graphics (integrated)',
      memory: '16GB LPDDR5X on package (not upgradeable)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '14-inch FHD+ (1920 x 1200) OLED 16:10, 60Hz, 600 nits peak, glossy',
      battery: '75Wh',
      weight: '1.30 kg',
      ports: '2x Thunderbolt 4, 2x USB-A 3.2 Gen 1, HDMI 2.1, microSD reader, audio jack',
      charging: '65W USB-C adapter',
    },
    pros: [
      'Two Thunderbolt 4 ports plus HDMI 2.1 for docks and high-refresh external monitors.',
      'Lightest Intel model in this list, with a 75Wh battery.',
      'microSD reader, handy for Raspberry Pi and embedded projects.',
    ],
    cons: [
      'Memory is on the processor package, so 16GB is permanent.',
      'Glossy OLED panel can reflect bright lights in a classroom or office.',
    ],
    priceBand: null,
  },
  {
    id: 'zenbook-14-oled-um3406ka',
    name: 'ASUS Zenbook 14 OLED',
    modelCode: 'UM3406KA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/zenbook/asus-zenbook-14-oled-um3406/',
    bestFor: 'Lightest, with the best screen',
    summary: 'The lightest laptop in this list at 1.20 kg, with an AMD Ryzen AI 5 340, a sharp 3K 120Hz OLED display and a 75Wh battery. A good choice if you carry your laptop all day and read code for hours.',
    specs: {
      processor: 'AMD Ryzen AI 5 340 (6 cores, 12 threads, up to 4.8 GHz)',
      graphics: 'AMD Radeon Graphics (integrated)',
      memory: '16GB LPDDR5X on board (not upgradeable)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '14-inch 3K (2880 x 1800) OLED 16:10, 120Hz, 600 nits peak, anti-glare',
      battery: '75Wh',
      weight: '1.20 kg',
      ports: '1x USB4 (40Gbps), 1x USB-C 3.2 Gen 2, 1x USB-A 3.2 Gen 1, HDMI 2.1, audio jack',
      charging: '65W USB-C adapter',
    },
    pros: [
      '3K resolution makes small code fonts noticeably crisper than FHD+.',
      '1.20 kg and 75Wh: the best carry-around combination here.',
      'USB4 port for fast storage and docks.',
    ],
    cons: [
      '6 cores: fewer than the H-series Intel models, so large builds take longer.',
      'Only one USB-A port; keep a USB-C adapter for older accessories.',
      'RAM is soldered, so 16GB is permanent.',
    ],
    priceBand: null,
  },
  {
    id: 'vivobook-s16-s3607va',
    name: 'ASUS Vivobook S16',
    modelCode: 'S3607VA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-s16-s3607/',
    bestFor: 'Best big screen without a monitor',
    summary: 'Essentially the Vivobook S14 (S3407VA) in a 16-inch body: same Core i5-13420H, same upgradeable 16GB DDR5 and 512GB SSD, with more screen space for an editor and a terminal side by side.',
    specs: {
      processor: 'Intel Core i5-13420H (8 cores, 12 threads, up to 4.6 GHz)',
      graphics: 'Intel UHD Graphics (integrated)',
      memory: '16GB DDR5 (8GB on board + 8GB SO-DIMM)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '16-inch FHD+ (1920 x 1200) 16:10, 300 nits, anti-glare',
      battery: '70Wh',
      weight: '1.70 kg',
      ports: '2x USB-C 3.2 Gen 1 (display + charging), 2x USB-A 3.2 Gen 1, HDMI 1.4, audio jack',
      charging: '65W USB-C adapter',
    },
    pros: [
      'Larger 16-inch screen for split-screen work if you rarely use an external monitor.',
      'Upgradeable RAM through the SO-DIMM slot.',
      'Same 70Wh battery and USB-C charging as the 14-inch model.',
    ],
    cons: [
      '1.70 kg is noticeably heavier to carry every day.',
      'FHD+ stretched over 16 inches is less sharp than the 14-inch models.',
      'HDMI 1.4.',
    ],
    priceBand: null,
  },
  {
    id: 'vivobook-16x-k3605zu',
    name: 'ASUS Vivobook 16X',
    modelCode: 'K3605ZU',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-16x-k3605/',
    bestFor: 'Best for machine learning and game development',
    summary: 'The only laptop here with a dedicated NVIDIA GPU, an RTX 4050 with 6GB of video memory. Pick it if you will train small machine-learning models with CUDA, work in Unity or Unreal, or run local AI models.',
    specs: {
      processor: 'Intel Core i5-12450H (8 cores, up to 4.4 GHz)',
      graphics: 'NVIDIA GeForce RTX 4050 Laptop GPU, 6GB GDDR6',
      memory: '16GB DDR4 on board (spec sheet also lists a DDR4 SO-DIMM slot)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '16-inch FHD+ (1920 x 1200) 16:10, 60Hz, 300 nits, anti-glare',
      battery: '70Wh',
      weight: '1.80 kg',
      ports: '1x Thunderbolt 4, 2x USB-A 3.2 Gen 1, HDMI 2.1, SD 4.0 card reader, audio jack',
      charging: '120W barrel adapter',
    },
    pros: [
      'CUDA-capable NVIDIA GPU for PyTorch/TensorFlow experiments and game engines.',
      'Thunderbolt 4 and HDMI 2.1 for external displays.',
      'Spec sheet lists a SO-DIMM slot for adding memory later.',
    ],
    cons: [
      'Heaviest model here at 1.80 kg, with a separate 120W charger.',
      '6GB of GPU memory limits the size of models you can train locally.',
      'Older 12th-gen processor and DDR4 memory.',
    ],
    priceBand: null,
  },
  {
    id: 'vivobook-14-x1407qa',
    name: 'ASUS Vivobook 14 (Snapdragon X)',
    modelCode: 'X1407QA',
    productUrl: 'https://www.asus.com/in/laptops/for-home/vivobook/asus-vivobook-14-x1407q/',
    bestFor: 'Arm laptop: check your tools first',
    summary: 'A Copilot+ PC with a Qualcomm Snapdragon X processor. It runs Windows on Arm, which is efficient, but every tool you rely on needs an Arm build or must run under Windows\' x86 emulation. Read the Arm section above before choosing it.',
    specs: {
      processor: 'Qualcomm Snapdragon X X1-26-100 (8 cores, up to 2.97 GHz)',
      graphics: 'Qualcomm Adreno GPU (integrated)',
      memory: '16GB LPDDR5X on board (not upgradeable)',
      storage: '512GB M.2 NVMe PCIe 4.0 SSD',
      display: '14-inch FHD+ (1920 x 1200) 16:10, 60Hz, 300 nits, anti-glare',
      battery: '50Wh',
      weight: '1.49 kg',
      ports: '2x USB4 (40Gbps), 2x USB-A 3.2 Gen 1, HDMI 2.1, audio jack',
      charging: '65W USB-C adapter',
    },
    pros: [
      'Two USB4 ports and HDMI 2.1.',
      'Arm processors are designed for efficiency, which suits long days away from a socket.',
    ],
    cons: [
      'Windows on Arm: some developer tools, drivers and VPN clients have no Arm version yet.',
      'Smaller 50Wh battery than the Intel and AMD models here.',
      'RAM is soldered, so 16GB is permanent.',
    ],
    priceBand: null,
  },
]

// The buying guide shown before the product cards. Plain text with no HTML.
export const GUIDE = [
  {
    id: 'ram',
    heading: 'Why 16GB of RAM is the sensible minimum',
    paragraphs: [
      'A normal coding session runs several memory-hungry programs at once: an editor or IDE such as VS Code or IntelliJ IDEA, a browser with documentation and Stack Overflow open, a local server, often a database, and increasingly Docker. On an 8GB Windows laptop that combination pushes the system into swapping memory to the SSD, and everything starts to stutter.',
      '16GB removes that bottleneck for web development, Java and Spring Boot, Python, data analysis with pandas, and most college projects. It is also workable for Android Studio with the emulator, though very large Android or machine-learning projects are happier with 32GB.',
      'Check how the memory is fitted. "On board" or "on package" memory is soldered and can never be upgraded. A laptop that lists a SO-DIMM slot can take a bigger module later, which is a cheap way to extend its life.',
    ],
  },
  {
    id: 'storage',
    heading: 'Is 512GB of storage enough?',
    paragraphs: [
      'For most students and working developers, yes, with some housekeeping. Development tools grow quietly: JDKs, Python virtual environments, node_modules folders, Docker images and the Android SDK each take gigabytes. Clear old Docker images and unused node_modules now and then, and keep large media files in cloud storage.',
      'All the laptops below use NVMe PCIe 4.0 SSDs, which keeps project indexing, package installs and builds fast. Each has a single M.2 2280 slot that is already in use, so upgrading storage means replacing the drive rather than adding a second one.',
    ],
  },
  {
    id: 'cpu',
    heading: 'Processor: cores matter more than clock speed',
    paragraphs: [
      'Compiling, running tests, bundling a front end and building containers all spread work across several cores. Intel\'s H-series chips (such as the Core i5-13420H and Core i5-13500H) are built for sustained performance and suit heavier builds. Thinner chips such as Intel\'s V-series and AMD\'s Ryzen AI 5 340 trade some peak speed for battery life and lower weight.',
      'Many new laptops advertise an NPU for AI. Coding assistants such as GitHub Copilot and ChatGPT run in the cloud, so the NPU does not make them faster; treat it as a bonus, not a reason to buy.',
    ],
  },
  {
    id: 'screen',
    heading: 'Screen, weight and battery',
    paragraphs: [
      'A 16:10 screen shows more lines of code than the older 16:9 shape, and all but one laptop here (the Vivobook S 15 OLED) use 16:10. At 14 inches, FHD+ (1920 x 1200) is sharp enough; the 3K panel on the Zenbook 14 OLED is noticeably crisper for small fonts. Anti-glare screens are easier in bright rooms than glossy OLED panels.',
      'If you carry your laptop to college or the office every day, aim for about 1.4 kg or less and a battery of 70Wh or more. A 16-inch laptop is worth the extra weight only if you rarely plug into an external monitor.',
    ],
  },
  {
    id: 'ports',
    heading: 'Ports and external monitors',
    paragraphs: [
      'A second screen is one of the biggest productivity upgrades for programming. HDMI 1.4 can only drive a 4K monitor at 30Hz, which feels sluggish, so models with HDMI 1.4 pair best with a 1080p or 1440p monitor or a USB-C monitor. Thunderbolt 4 and USB4 ports can run docks and high-resolution displays from a single cable.',
      'USB-C charging is more useful than it sounds: one compact charger can power your laptop and phone, and you can borrow a classmate\'s USB-C charger in a pinch.',
    ],
  },
  {
    id: 'gpu',
    heading: 'Do you need a dedicated graphics card?',
    paragraphs: [
      'For web, mobile, backend, Java, Python and database work, no. Integrated graphics handle editors, browsers and multiple monitors without trouble.',
      'A dedicated NVIDIA GPU matters if you will train machine-learning models with CUDA, build games in Unity or Unreal, or run local AI models. In that case the RTX 4050 in the Vivobook 16X is the only option in this list.',
    ],
  },
  {
    id: 'arm',
    heading: 'Windows on Arm (Snapdragon X): check your tools first',
    paragraphs: [
      'Snapdragon X laptops use Arm processors instead of Intel or AMD x86 chips. Many popular developer tools now ship native Arm builds for Windows, and Windows can run most other x86 apps through its built-in emulation. Emulated apps run slower, though, and anything that installs its own drivers, such as some VPN clients, hardware debuggers and older anti-cheat or virtualisation tools, may not work at all.',
      'Before choosing an Arm laptop, list the tools your course or job requires and confirm each one supports Windows on Arm. If you are unsure, an Intel or AMD laptop is the safer choice.',
    ],
  },
  {
    id: 'os',
    heading: 'Windows, Linux and WSL',
    paragraphs: [
      'All these laptops ship with Windows 11 Home. Windows Subsystem for Linux (WSL 2) works on Home and gives you a real Linux environment for terminals, shell scripts, Docker and server-side tools without dual booting. If you plan to replace Windows with Linux entirely, check driver support for the exact model first, especially Wi-Fi, sleep and the trackpad.',
    ],
  },
]

export const METHOD = [
  'We started from every laptop on ASUS India\'s website and kept only configurations that the ASUS India tech-spec sheet lists with exactly 16GB of RAM and a 512GB SSD.',
  'From those we picked models that cover different needs: portability, sustained performance, docking, a large screen, a dedicated GPU and an Arm option.',
  'Every specification on this page is copied from the official ASUS India tech-spec sheet for the model code shown. We have not run our own benchmarks on these units, and we say so rather than invent numbers.',
  'Configurations and prices change often. Always check the model code and the specification on the ASUS page before you buy.',
]

export const FAQS = [
  ['Is 16GB of RAM enough for coding in 2026?', 'For web development, Java and Spring Boot, Python, databases and most student projects, yes. It also handles Android Studio with the emulator. Very large Android builds, several Docker services at once, or local machine-learning work benefit from 32GB, so prefer a laptop with an upgradeable SO-DIMM slot if you expect to grow into that.'],
  ['Is 512GB SSD enough for a programmer?', 'Usually, yes. Development tools take several gigabytes each, so clean up old Docker images and unused dependency folders from time to time and keep large media in cloud storage. All the laptops here use fast NVMe PCIe 4.0 drives.'],
  ['Do I need a graphics card for programming?', 'Only for CUDA-based machine learning, game development or running local AI models. For web, backend, mobile and data work, integrated graphics are enough.'],
  ['Can I use a Snapdragon (Arm) laptop for programming?', 'Often, yes, but check that every tool you need has a Windows on Arm version or runs under emulation. Tools that install their own drivers are the most likely to cause problems. If in doubt, choose Intel or AMD.'],
  ['Which of these laptops have upgradeable RAM?', 'According to the ASUS India spec sheets, the Vivobook S14 (S3407VA) and Vivobook S16 (S3607VA) have 8GB on board plus an 8GB SO-DIMM module that can be replaced, and the Vivobook 16X (K3605ZU) lists a SO-DIMM slot next to its on-board memory. The Vivobook S 15 OLED, Vivobook S 14 OLED, Zenbook 14 OLED and Snapdragon Vivobook 14 have soldered memory.'],
  ['Why does this page only list ASUS laptops?', 'We take part in the ASUS India affiliate programme, so this page covers ASUS models we can link to. Lenovo, HP, Dell, Acer and Apple all make good programming laptops too, and the buying advice in the guide applies to any brand.'],
]

export const LEARNING_LINKS = [
  { to: '/learn/java-core', label: 'Core Java course' },
  { to: '/learn/python', label: 'Python course' },
  { to: '/learn/javascript', label: 'JavaScript course' },
  { to: '/learn/spring-boot', label: 'Spring Boot course' },
  { to: '/codelab/playground', label: 'Online code playground' },
]
