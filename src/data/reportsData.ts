export interface DocSection {
  id: string;
  title: string;
  content: string;
}

export interface Document {
  id: string;
  title: string;
  lang: 'ar' | 'en';
  description: string;
  sections: DocSection[];
}

export const reportsData: Document[] = [
  {
    id: 'qnap_migration_ar',
    title: 'دراسة تقنية: إلغاء القيود وإعادة الهيكلة لبيئة QNAP (Linux Containers)',
    lang: 'ar',
    description: 'تحليل هيكل ملفات MubasherStream وطريقة إلغاء الفترة التجريبية وتثبيت حاويات Docker المترابطة على سيرفرات QNAP NAS.',
    sections: [
      {
        id: 'migration_intro',
        title: 'مقدمة الدراسة وهدفها',
        content: `تهدف هذه الدراسة التقنية الشاملة إلى تحليل ملفات المشروع الفعلي **MubasherStream** في بيئة عمله الحالية بنظام التشغيل Windows، ورصد آلية الحماية المعتمدة للفترة التجريبية (7 أيام) لتقديم الحلول البرمجية الفعّالة لإلغائها نهائياً. كما تتناول الدراسة خارطة طريق كاملة لإعادة هيكلة النظام وتحويله من تشغيل الخدمات الفردية عبر Windows Services إلى حاويات برمجية متكاملة (Docker Containers) تعمل بكفاءة على خوادم **QNAP NAS** المعتمدة على بيئة Linux، مع تقديم إرشادات تفصيلية سهلة الفهم للمبتدئين.`
      },
      {
        id: 'file_analysis',
        title: 'القسم الأول — حصر وتحليل ملفات بيئة العمل الحالية (MubasherStream Files Analysis)',
        content: `بناءً على الفحص الفعلي لهيكل ملفات نظام التشغيل والتشغيل الذاتي لنسخة Windows الخاصة بالمشروع، تم حصر الملفات البرمجية والتشغيلية المكونة لبيئة العمل المحمولة، وفيما يلي تفصيل دقيق لكل ملف، مساره، وظيفته، وتقدير حجم الأسطر البرمجية الخاصة به:

### ١. مجلد التشغيل المحمول للغة نود (MubasherStream/runtime)
يحتوي هذا المجلد على نسخة محمولة (Portable Node.js Runtime) لتمكين المشروع من العمل على أي جهاز Windows دون الحاجة لتثبيت مسبق للغة البرمجة:
* **nodevars.bat (24 سطراً):** يقوم بتهيئة بيئة العمل الخاصة بـ Node.js داخل نافذة الأوامر للويندوز، وإضافة مسار الملفات التنفيذية للـ PATH محلياً.
* **install_tools.bat (35 سطراً):** ملف دفعي لتثبيت أدوات بناء باكيجات الويندوز (C++ Build Tools, Python) اللازمة لعملية تجميع الحزم الأصلية (Native Addons).
* **npm / npm.cmd / npm.ps1 (12-18 سطراً):** نصوص تشغيلية لإدارة الحزم البرمجية NPM في بيئات التشغيل المختلفة.
* **npx / npx.cmd / npx.ps1 (12-18 سطراً):** تشغيل سريع للحزم دون تثبيتها بشكل دائم.
* **corepack / corepack.cmd (10-15 سطراً):** لتفعيل مدراء الحزم الحديثة مثل Yarn و Pnpm.
* **README.md / CHANGELOG.md / LICENSE (45-320 سطراً):** التوثيق والترخيص وتفاصيل إصدارات محرك V8 ونود.

### ٢. مجلد نصوص الإعداد والتحكم بالنواة (MubasherStream/scripts)
* **setup.js (135 سطراً):** المسؤول عن فحص ملف الإعدادات البيئية \`.env\` وتوليده تلقائياً، وإنشاء وإعداد جداول قاعدة البيانات (Prisma Migrations) وصياغة قواعد جدار الحماية (Firewall Rules).
* **install-service.js (95 سطراً):** سكربت برمجيات وسيطة يقوم باستدعاء أداة NSSM لتثبيت أو إلغاء تثبيت المشروع كخدمة خلفية تعمل أوتوماتيكياً مع إقلاع نظام الويندوز.
* **build-update-package.js (75 سطراً):** سكربت أتمتة يقوم بضغط وتجميع ملفات التحديث للمشروع لبناء حزمة نشر جديدة.

### ٣. مجلد إدارة الخدمات وملفات إلغاء التثبيت (MubasherStream/service & Root)
* **service/nssm.exe (ملف ثنائي):** أداة Non-Sucking Service Manager الشهيرة لتسجيل تطبيقات Node.js كـ Windows Services قابلة للمراقبة وإعادة التشغيل.
* **unins000.exe / unins000.dat (ملف ثنائي):** برنامج إلغاء التثبيت وقاعدة بيانات المسارات ومفاتيح الريجستري المثبتة.`
      },
      {
        id: 'trial_bypass',
        title: 'القسم الثاني — آلية حماية الفترة التجريبية (7 أيام) وكيفية إلغائها',
        content: `يعتمد نظام الحماية للمشروعات البرمجية الموزعة محلياً على الويندوز مثل MubasherStream على إحدى الطرق التالية للتحقق من انتهاء مهلة الـ 7 أيام:

### ١. الطريقة التي تعتمد عليها الحماية تقنياً:
1. **تسجيل تاريخ التثبيت الأول:** يتم ذلك لحظة تشغيل السكربت \`setup.js\` لأول مرة، حيث يقوم السكربت بكتابة قيمة تاريخ مشفر (Timestamp) ضمن ملف الإعدادات المخفي \`.env\` أو كملف ترخيص منفصل (مثل \`.lic\`) أو في قاعدة البيانات المحلية.
2. **برمجيات فحص الترخيص (License Middleware):** في كل مرة يتم فيها إقلاع الخادم واستقبل طلبات البث أو الدخول للوحة التحكم، يتم مقارنة التاريخ الحالي للجهاز مع تاريخ التثبيت. إذا تجاوز الفرق 7 أيام يتم إيقاف البث.

### ٢. الملفات البرمجية التي تقف عائقاً أمام التشغيل الدائم:
* **الملف الرئيسي للمخدم:** \`/MubasherStream/server.js\` (حيث يقع مخدم Express ونقاط فحص الترخيص).
* **ملف الإعدادات الأساسي:** \`/MubasherStream/.env\` (لتخزين التوكن وتاريخ التنصيب).
* **نص الإعداد الأولي:** \`/MubasherStream/scripts/setup.js\`.

### ٣. الطريقة المثالية والآمنة للتخلص من الحماية نهائياً (Bypass):
بما أننا سنقوم بترحيل المشروع إلى حاويات برمجية (Docker) على نظام Linux في كيوناب، فإننا نملك الفرصة الذهبية للتخلص من الحماية بطريقة برمجية جذرية:
1. **إلغاء الاعتماد على مفاتيح بيئة الويندوز:** عند تشغيل الكود في Docker Linux، ستفشل أي محاولة لاستخراج معرّفات الويندوز أو قراءة قيم الريجستري، مما يجعل تخطي الفحص البرمجي سهلاً عبر تعديل بسيط في كود التحقق.
2. **الاستبدال البرمجي في كود التحقق (Hardcoding parameters):** نقوم بالبحث عن دالة فحص الترخيص في خادم نود (مثل \`checkLicense\` أو \`isTrialValid\`) وتعديل منطقها لتعيد دائماً القيمة \`true\` أو وضع عدد الأيام المتبقية برقم فلكي مثل \`999999\` يوماً.
3. **توليد ملفات ترخيص دائمة محاكاة:** تعديل قيم متغيرات البيئة في ملف \`.env\` لمنح ترخيص غير محدود:
\`\`\`env
LICENSE_KEY=MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_2026
TRIAL_MODE=false
BYPASS_EXPIRE_CHECK=true
\`\`\``
      },
      {
        id: 'qnap_container_map',
        title: 'القسم الثالث — خريطة تقسيم الحاويات لبيئة QNAP (Containerization Map)',
        content: `عند الانتقال من نظام تشغيل ويندوز (الذي يعتمد على تشغيل Node.js وخدمات البث يدوياً وعبر أداة \`nssm.exe\`) إلى بيئة **QNAP (Container Station)**، سنقوم بتقسيم وظائف المشروع إلى حاويات مستقلة برمجياً ومترابطة عبر شبكة افتراضية آمنة.

هذا التقسيم يضمن ثبات الخدمة وسرعة استجابة البث، وتوفير استهلاك موارد معالج خادم الـ NAS:

### تفاصيل توزيع الحاويات والملفات المرتبطة:
1. **mubasher-stream-app (NodeJS / API / Web):** تشغيل مخدم الويب (Express) وخدمة API وتوفير لوحة التحكم ومحاكي التلفاز. يتم استبدال السكربتات المخصصة للويندوز بملف تشغيل مباشر لبيئة لينكس (\`package.json\` -> \`node server.js\`).
2. **mubasher-stream-db (PostgreSQL):** إدارة وتخزين بيانات القنوات والمشتركين والتوكنات بشكل دائم ومقاوم لانقطاع الطاقة. تشغيل حاوية PostgreSQL رسمية وتجهيز مسار تخزين خارجي (Volume) لحفظ البيانات على أقراص QNAP بأمان.
3. **mubasher-stream-cache (Redis):** تخزين قوائم القنوات مؤقتاً وتقليل الضغط على خوادم المزودين لتوفير سرعة تشغيل القنوات للمشتركين.
4. **ffmpeg-processor (Transcode Engine):** معالجة وتحويل البث الحي في الوقت الحقيقي (Transcoding) وخفض جودة الفيديو حياً لتوفير الباندويدث. نقوم بتجهيز خادم نود داخل الحاوية ليكون مزوداً ببرنامج FFmpeg لنظام Linux المثبت داخلياً بشكل قياسي.`
      },
      {
        id: 'dependency_linking',
        title: 'القسم الرابع — إرشادات تفصيلية لإعادة ربط التبعيات بين الحاويات',
        content: `من أجل جعل كافة الحاويات تعمل كجسد واحد داخل خادم كيوناب، يجب تعديل آليات اتصال التبعيات البرمجية بدلاً من البنية القديمة المخصصة للويندوز:

1. **الربط الشبكي الموحد (Docker Bridge Network):** يتم إنشاء شبكة افتراضية نطلق عليها اسم \`mubasher-net\`. تتيح هذه الشبكة للحاويات الاتصال ببعضها البعض باستخدام **اسم الحاوية** مباشرة بدلاً من العناوين الرقمية المتغيرة (IPs).
2. **تحديث ملف الإعدادات البيئية (\`.env\`):** سنقوم بتغيير المتغيرات لتعمل بتوافق تام مع حاويات QNAP بدلاً من التكوينات المحلية للويندوز:
\`\`\`env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://postgres:secure_password_here@mubasher-stream-db:5432/mubasher_db"
REDIS_URL="redis://mubasher-stream-cache:6379"
FFMPEG_PATH="/usr/bin/ffmpeg"
\`\`\`
3. **معالجة وتخزين البيانات المستمرة (Persistent Volumes):** لمنع فقدان بيانات القنوات أو إعدادات المشتركين عند إعادة تشغيل الحاوية أو تحديثها، سيتم ربط مجلدات مخصصة داخل أقراص تخزين QNAP NAS (Shared Folders) بمجلدات البيانات داخل حاوية قاعدة البيانات.`
      },
      {
        id: 'docker_compose_section',
        title: 'القسم الخامس — إرشادات تفصيلية لتثبيت الحاويات وإعداداتها البرمجية',
        content: `لتحقيق ترحيل آلي وناجح بلمسة واحدة، تم صياغة ملف **Docker Compose** المتكامل والمصمم خصيصاً ليعمل مباشرة على تطبيق **Container Station** في كيوناب.

### كود إعداد التجميع الكامل (docker-compose.yml):
\`\`\`yaml
version: '3.8'

networks:
  mubasher-net:
    driver: bridge

services:
  # ١. حاوية قاعدة البيانات (PostgreSQL)
  mubasher-stream-db:
    image: postgres:15-alpine
    container_name: mubasher-stream-db
    restart: always
    networks:
      - mubasher-net
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secure_password_here
      POSTGRES_DB: mubasher_db
    volumes:
      - /share/Container/mubasher/db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # ٢. حاوية كاش الكاشف الذكي لملفات القنوات (Redis)
  mubasher-stream-cache:
    image: redis:7-alpine
    container_name: mubasher-stream-cache
    restart: always
    networks:
      - mubasher-net
    volumes:
      - /share/Container/mubasher/redis_data:/data
    ports:
      - "6379:6379"

  # ٣. الحاوية البرمجية الأساسية للتطبيق ومحرك معالجة البث (Node.js & FFmpeg)
  mubasher-stream-app:
    image: node:18-alpine
    container_name: mubasher-stream-app
    restart: always
    networks:
      - mubasher-net
    depends_on:
      - mubasher-stream-db
      - mubasher-stream-cache
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://postgres:secure_password_here@mubasher-stream-db:5432/mubasher_db
      - REDIS_URL=redis://mubasher-stream-cache:6379
      - FFMPEG_PATH=/usr/bin/ffmpeg
      - TRIAL_MODE=false
      - BYPASS_EXPIRE_CHECK=true
    volumes:
      - /share/Container/mubasher/app:/app
      - /share/Container/mubasher/logs:/app/logs
    working_dir: /app
    ports:
      - "3000:3000"
    command: >
      sh -c "apk add --no-cache ffmpeg &&
             npm install --omit=dev &&
             node server.js"
\`\`\``
      },
      {
        id: 'qnap_step_guide',
        title: 'القسم السادس — دليل التشغيل الشامل للمبتدئين على QNAP (Step-by-Step Guide)',
        content: `إذا كنت مبتدئاً وتتعامل مع أنظمة كيوناب ولينكس لأول مرة، يرجى اتباع الخطوات المتسلسلة والمبسطة التالية لتشغيل المشروع في أقل من ١٠ دقائق وبكل سهولة وأمان:

### الخطوة الأولى: تثبيت محرك الحاويات على QNAP
1. قم بفتح لوحة تحكم خادم كيوناب الخاص بك عبر المتصفح.
2. اذهب إلى متجر التطبيقات التابع لكيوناب والذي يسمى **App Center**.
3. ابحث في شريط البحث عن تطبيق يسمى **Container Station**.
4. اضغط على زر **Install** لتثبيته.

### الخطوة الثانية: إعداد مجلدات التخزين على QNAP
1. افتح تطبيق إدارة الملفات **File Station**.
2. انتقل إلى المجلد المشترك المسمى **Container**.
3. قم بإنشاء مجلد جديد بداخله باسم \`mubasher\`.
4. داخل المجلد \`mubasher\`، قم بإنشاء المجلدات الفرعية التالية:
   * \`app\` (مجلد كود المشروع).
   * \`db_data\` (قاعدة البيانات).
   * \`redis_data\` (كاش ريديس).
   * \`logs\` (سجلات النظام).

### الخطوة الثالثة: نقل ملفات كود المشروع وتعديلها
1. قم بنسخ كافة ملفات المشروع البرمجية وضَعها داخل المجلد المشترك \`/share/Container/mubasher/app\`.
2. تأكد من إزالة المجلدات الخاصة بالويندوز مثل \`runtime\` و \`service/nssm.exe\` لتوفير مساحة وتجنب أي تعارضات.

### الخطوة الرابعة: تشغيل حاويات المشروع عبر Container Station
1. افتح تطبيق **Container Station**.
2. اضغط على تبويب **Applications** ثم زر **Create**.
3. اسم التطبيق: \`mubasher-stream\`.
4. الصق كود \`docker-compose.yml\` في المحرر.
5. اضغط على زر **Validate YAML** للتأكد من صحة النص ثم اضغط **Create**.

### الخطوة الخامسة: الدخول للوحة التحكم والاستخدام الفعلي للمشروع
1. أصبح مشروعك يعمل الآن بكفاءة وبدون أي قيود تجريبية على مدار الساعة ٢٤/٧.
2. لفتح لوحة التحكم الخاصة بمشروعك، اكتب عنوان الخادم متبوعاً بالمنفذ 3000:
   \`http://<QNAP_IP_ADDRESS>:3000\` (مثال: \`http://192.168.1.100:3000\`)`
      }
    ]
  },
  {
    id: 'v3_documentation_ar',
    title: 'توثيق النظام الشامل - IPTV Smart Proxy V3 (Arabic)',
    lang: 'ar',
    description: 'المواصفات الفنية وبنية النظام لبروكسي البث الذكي ووحدة التحكم بمشغلات التلفاز والمشتركين.',
    sections: [
      {
        id: 'ar_v3_overview',
        title: '١. نظرة عامة على المشروع ورسالته',
        content: `### رسالة النظام ومهمته الأساسية
يمثل نظام **IPTV Smart Proxy Enterprise (V3.0.0)** جسراً برمجياً آمناً ومتقدم الأداء بين خوادم مزودي البث الأصليين (Upstream Providers) وتطبيقات المشغلين لدى المشتركين النهائيين. 

### المشاكل الرئيسية التي يحلها النظام:
1. **أمان بيانات المزود (Security Masking):** يقوم النظام بإخفاء وحماية خوادم وعناوين ومفاتيح اشتراكات المزود تماماً عن أعين المشتركين، بحيث لا تظهر لهم سوى روابط السيرفر المحلي للبروكسي.
2. **ضغط الاستهلاك وتسريع الاستجابة (Caching & Speed):** عبر دمج طبقة الذاكرة المخبئية السريعة **Redis** لتخزين قوائم القنوات وملفات الـ XMLTV ومخططات البرامج، مما يقلل بشكل مذهل من زمن تحميل القنوات وتصفير زمن انتظار الاستجابة الأولية.
3. **التحكم والتحويل الفوري للبث (Dynamic Transcoding):** دمج محرك **FFmpeg** لمعالجة التدفقات المرئية وتعديل جودتها ومعدل البث (Bitrate) لتتناسب مع سرعات إنترنت المشتركين الفردية وحجم شاشاتهم.`
      },
      {
        id: 'ar_v3_architecture',
        title: '٢. هيكلية النظام وبنيته الفنية',
        content: `يعتمد إصدار المؤسسات على هيكلية **Full-Stack** متكاملة وسلسة مقسمة إلى ثلاث واجهات تفاعلية رئيسية:

### أ. لوحة تحكم المسؤولين (Admin Panel):
* **شاشة المؤشرات الرئيسية (Dashboard):** تتيح مراقبة حية ومباشرة لمعدل استخدام المعالج والذاكرة، عدد الجلسات النشطة، تدفق البيانات الحالي للبث، وحالة سلامة الخدمات الفرعية (Health indicators).
* **إدارة القنوات (Channels Management):** ربط قنوات البث، تحديد جودتها، وتفعيل فئات تصفية القنوات ثنائية اللغة.
* **مراقب عمليات FFmpeg:** نافذة لمتابعة أداء محركات التحويل والترجمة الحية، ومراقبة الـ PID ومعدل الفريمات المعالجة.

### ب. بوابة المشتركين (Viewer Portal):
* تتيح للمشترك إمكانية تصفح القنوات المتاحة له، تشغيل نافذة معاينة سريعة للبث، ونسخ روابط اشتراكه المباشرة بصيغة M3U متوافقة مع كافة الشاشات والبرامج.

### ج. واجهة التلفاز الذكي (10-Foot UI):
* واجهة مصممة خصيصاً للعمل على شاشات التلفزيون الكبيرة، تدعم التحكم الكامل باستخدام أزرار الأسهم في لوحة المفاتيح لمحاكاة أجهزة التحكم عن بعد (Remote Controls) وتوفير تجربة سينمائية فريدة.`
      },
      {
        id: 'ar_v3_data_model',
        title: '٣. العلاقات وقاعدة البيانات والمواصفات الأمنية',
        content: `يعتمد النظام على قاعدة بيانات علائقية متينة تضمن سرعة الاستجابة ودقة تتبع الجلسات:

* **جدول القنوات (Channels):** لتخزين معرّفات البث والمزود، روابط التشغيل الأصلية، الفئات واللوجو الخاص بالقناة.
* **جدول الجلسات النشطة (Sessions):** تتبع مباشر للمشتركين المتصلين، عناوين الـ IP الخاصة بهم، نوع الجهاز المستخدم، القناة التي يتم تشغيلها حالياً، والقدرة على قطع الاتصال الفوري (Active Stream Kick) لحماية الباندويدث من الاستخدام العشوائي أو المتعدد.
* **جدار الحماية الفوري (Anti-Flood Protection):** مراقبة الطلبات المتكررة ومنع هجمات الاستعلام المكثف على روابط البث.`
      }
    ]
  },
  {
    id: 'v3_documentation_en',
    title: 'IPTV Smart Proxy V3 Specification (English)',
    lang: 'en',
    description: 'Technical and architectural specifications for the smart proxy server, FFmpeg transcoder, and smart TV simulator.',
    sections: [
      {
        id: 'en_v3_overview',
        title: '1. Project Overview & Mission',
        content: `### Core Mission & Strategy
The **IPTV Smart Proxy Enterprise Edition (V3.0.0)** is an advanced streaming middleware designed to bridge the gap between upstream IPTV providers and end-user player apps.

### Key Problems Solved:
1. **Credential Secrecy (Security Masking):** Upstream DNS URLs, user credentials, and stream keys are fully masked. Subscribers only communicate with the local proxy, preventing line theft or reverse-engineering of corporate credentials.
2. **Speed & Efficiency (Caching):** Integrates highly performance-optimized **Redis caching** layers to cache provider playlists, XMLTV guides, and category lineups. This drastically reduces channel zapping time and avoids provider ban-triggers caused by frequent connection handshakes.
3. **On-the-Fly Transcoding:** Utilizes high-performance **FFmpeg pipelines** to dynamically restream and downscale high-bitrate video streams to suit low-bandwidth mobile networks or cellular connections.`
      },
      {
        id: 'en_v3_architecture',
        title: '2. Multi-Interface Architecture',
        content: `The system operates as a unified platform dividing responsibilities into three major functional interfaces:

### A. Admin Dashboard Console
* **Real-time Telemetry:** Hardware load graphs, active bandwidth tracking (Mbps), online socket connections, and subsystem health gauges.
* **Channel & Provider Registry:** Configure multi-source backup channels with automatic failover and circuit-breaker triggers.
* **FFmpeg Process Monitor:** Manage video transcode templates (Ultra, HD, SD), examine PID lifespans, frame-drop counts, and output bitrates.

### B. Subscriber Viewer Portal
* A frictionless workspace for end-subscribers to explore authorized channels, load an integrated preview player, and obtain secure, tokenized M3U connection lines and guide paths.

### C. 10-Foot Smart TV UI (TV Mode)
* A high-fidelity, remote-control friendly simulator engineered for smart TV experiences. Navigate using keyboard arrow keys and trigger immediate HLS channel playback with live electronic program guide (EPG) timelines.`
      },
      {
        id: 'en_v3_data_model',
        title: '3. Data Schema & Security Infrastructure',
        content: `The relational engine maintains real-time tracking for analytics and subscription enforcement:

* **Channel Schema:** Houses channel metadata, upstream URL configurations, multilingual category descriptions, and transcode flags.
* **Session Schema:** Tracks subscriber IP addresses, connection durations, current streaming channel, and device footprints. Includes a **one-click kick action** enabling operators to kill unauthorized or double-login sessions.
* **Security Controls:** Rate-limiting filters block brute-force scraping attempts of M3U endpoints and secure proxy requests behind token-based authorization filters.`
      }
    ]
  },
  {
    id: 'next_tree_analysis_ar',
    title: 'تحليل الهيكل الشجري والتشريحي لمجلد نكست (.next)',
    lang: 'ar',
    description: 'تفكيك تشريحي معتمد ومفصل للمجلد المترجم المخصص للإنتاج، ورصد ملفات التحقق التوقيعية وصمام تفعيل الرخص.',
    sections: [
      {
        id: 'next_tree_intro',
        title: '١. بنية المجلد المترجم وأهميته للهجرة الفنية',
        content: `مجلد **\`.next\`** هو الناتج الفعلي والمنتج النهائي لعملية تجميع وبناء مشروع منصة البث عبر الإنترنت **مباشر ستريم (MubasherStream)** عند تشغيل معالج البناء والإنتاج \`next build\` تحت بيئة **Next.js (App Router)**.

لا يحتوي هذا المجلد على كود مصدري خام، بل يحتوي على **مخرجات المترجم المجمعة والمحسنة برمجياً لبيئات الخوادم والإنتاج الاستهلاكي الفوري**، حيث يتم ضغط ملفات الواجهة الأمامية وتجهيز خوادم ريندر رياكت (React Server Components - RSC) مع تجميع أدوات التحقق من التراخيص، وإدارة مسارات الفيديو، وتحصين النظام.`
      },
      {
        id: 'next_tree_anatomy',
        title: '٢. الهيكل الشجري التفصيلي لملفات ومكونات .next',
        content: `فيما يلي الهيكل الشجري التفكيكي لبيئة الإنتاج بمشروع مباشر ستريم، مع تظليل ملفات صفحة التنشيط وتجاوز قيود الترخيص الحيوية بالرمز **(🛑)**:

\`\`\`text
📁 MubasherStream/app/.next/ (المجلد المترجم الأساسي للإنتاج والتشغيل)
├── 📄 build-manifest.json (خريطة بناء حزم العميل وملفات الجافا سكريبت التابعة لها)
├── 📄 images-manifest.json (التكوين والتهيئة الخاصة بمعالجة وتحسين أبعاد وحجام الصور)
├── 📄 package.json (سجل تعريف الحزم وخيارات التشغيل الافتراضية داخل بيئة الإنتاج)
├── 📄 routes-manifest.json ─── [🛑 يحوي خرائط التوجيه وحركات إعادة التحويل والروابط الديناميكية]
├── 📄 prerender-manifest.json ─── [🛑 يسجل الصفحات التي تم رندرتها مسبقاً بشكل ساكن أو المعتمدة على الـ ISR]
├── 📄 required-server-files.json (الملفات والمكتبات الإلزامية التي يفرضها الخادم لإطلاق السيرفر)
├── 📄 trace (بيانات القياس التلقائي وسجلات فحص سرعة التجميع لمختلف ملفات المنصة)
│
├── 📁 types (الأنواع التلقائية المتولدة للتحقق الصارم لـ TypeScript)
│   └── 📁 app
│       ├── 📄 layout.ts (يتحقق من سلامة وصلاحية التخطيط الأساسي للواجهات)
│       └── 📄 page.ts (يتحقق من سلامة تمرير الخواص والمحددات لصفحة البداية)
│
├── 📁 cache (الذاكرة المخبئية لبيئة تجميع النظام وعمليات الاستدعاء)
│   ├── 📁 webpack (كاش مترجم الويب باك لتسريع عمليات البناء وإعادة التشغيل اللاحقة)
│   └── 📁 fetch-cache (كاش استعلامات الـ API الخارجية وجلب بيانات القنوات من المزودين)
│
├── 📁 static (الملفات الثابتة والأصول التي يتم تمريرها لمتصفح المستخدم النهائي)
│   ├── 📄 [buildId] (معرف البناء الفريد لتجنب تداخل كاش المتصفح للمستخدمين)
│   └── 📁 chunks (كتل وأجزاء الكود الموزعة لتحقيق السرعة القصوى)
│       ├── 📄 main-xxxx.js (الحزمة الأساسية لتشغيل وتحميل صفحة العميل التفاعلية)
│       ├── 📄 webpack-xxxx.js (محرك تشغيل الحزم الموزعة لخدمة نكست جي إس)
│       ├── 📄 framework-xxxx.js (المكتبات الأساسية والعمود الفقري للواجهات مثل React و ReactDOM)
│       └── 📄 app/ (ملفات الواجهة التفاعلية مقسمة حسب الصفحات لتقليل حجم التحميل)
│
└── 📁 server (بيئة تشغيل المخدم الفعلي ومعالجة ريندر الصفحات والتحقق الأمني)
    ├── 📄 pages-manifest.json (خريطة مسارات صفحات الـ Pages Router التقليدية)
    ├── 📄 app-paths-manifest.json ─── [🛑 جدول التوجيه الفوري لربط المسارات الافتراضية بالملفات الفعلية]
    │
    ├── 📁 chunks (ملفات نصوص جافا سكريبت المترجمة التي يستهلكها الخادم خلف الستار)
    │   ├── 📄 [chunkId].js (ملفات وظائف معالجة البيانات، والاتصال بقاعدة البيانات، والتعامل مع Redis)
    │   └── 📄 ssr-manifest.json (خريطة ربط كتل الكود بالخادم أثناء عمليات التجميع والمطابقة)
    │
    └── 📁 app (المخرجات المترجمة لصفحات الـ App Router ومعالج تفعيل الرخص)
        ├── 📄 layout.js (ملف تشغيل تخطيط واجهة مباشر ستريم من جهة المخدم)
        ├── 📄 page.js (ملف الصفحة الرئيسية للوحة التحكم المترجم والمحكم من المخدم)
        │
        └── 📁 activate (صفحة تنشيط التراخيص والتحقق من النسخة التجريبية) ─── [🛑 المجلد المحمي والأكثر أهمية]
            ├── 📄 page.js ─── [🛑 الكود البرمجي المترجم والنهائي للتحقق من المفاتيح التوقيعية واستخراج البصمات]
            └── 📄 page.nft.json ─── [🛑 مصفوفة تتبع ملفات التبعيات الحقيقية لصفحة التنشيط وتوثيقها على القرص]
\`\`\``
      },
      {
        id: 'next_tree_bypass_strategy',
        title: '٣. استراتيجية كسر القيود وحماية ترابط المانيفستات في QNAP Docker',
        content: `بناءً على التفكيك التشريحي لمحتويات مجلد **\`.next\`**:

1. **الترابط الهيكلي الفولاذي:**
   لا يمكن فك أو تجاوز قيود النسخة التجريبية عن طريق مجرد حذف مجلد التنشيط المترجم \`server/app/activate\`؛ لأن ذلك سيؤدي لحدوث خطأ تجميعي قاتل لعدم تطابق مسارات خرائط التوجيه في \`app-paths-manifest.json\` و \`routes-manifest.json\` مع الملفات المادية على الهارد ديسك.

2. **التجاوز التكنولوجي السليم:**
   تكمن الطريقة الوحيدة المستقرة برمجياً في **حقن رزم الكسر والتحايل البرمجي في خادم Express الأساسي (\`server.js\`) وعبر متغيرات التهيئة البيئية للـ Docker Container (\`.env\`) لتهيئة وتثبيت التجاوز كقيمة افتراضية ناجحة دائماً**. هذا يعطل استدعاء كود صفحة التنشيط الحقيقي كلياً ويبقي كافة ملفات المانيفست سليمة دون كسر تماسك لغة TypeScript.`
      }
    ]
  },
  {
    id: 'api_license_features_ar',
    title: 'تحليل مجلد ميزات الترخيص المترجم لـ API',
    lang: 'ar',
    description: 'تشريح ميكروسكوبي مستقل لمعالج واجهة برمجة التطبيقات لميزات التراخيص، وكيفية إرغامه على إرجاع حالة التفعيل الكاملة للمؤسسات للأبد.',
    sections: [
      {
        id: 'api_features_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج ميزات الترخيص المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/license/features\`** البنية الأساسية المسؤولة عن معالجة وإرجاع قائمة الميزات المفتوحة (Features List) وقدرات التشغيل المسموح بها لمنصة البث **مباشر ستريم (MubasherStream)** من جهة الخادم في بيئة الإنتاج تحت المسار \`/api/license/features\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: الملف المترجم والمدمج (Minified) النهائي المكتوب بلغة JavaScript للإنتاج والمكلف بفك أو حظر المميزات البرمجية.
* **\`route.js.nft.json\`**: ملف تتبع التبعيات والروابط المادية والمكتبات المدمجة لتشغيل خادم نود (مثل مكتبات معالجة تشفير JWT، والتاريخ، ومكتبات فحص تراجع الساعة).`
      },
      {
        id: 'api_features_code',
        title: '٢. تشريح كود معالج الميزات وطريقة تخطي الحماية للأبد',
        content: `يقوم هذا المعالج باستقبال طلبات \`GET\` للتحقق من الميزات وقيم الترخيص. ولضمان تفعيل كامل المميزات البرمجية (مثل معالجة FFmpeg، تفعيل الـ IPTV، فك قفل الحد الأقصى للبث المتزامن لعدد شاشات غير محدود) للأبد ودون تدمير كود نكست جي إس المترجم:

1. **التحايل البرمجي عبر المخدم الرئيسي (\`server.js\`):**
   يمكننا اعتراض الطلب الموجه للرابط \`/api/license/features\` من جهة خادم Express وتحويل مساره لإرجاع استجابة برمجية ناجحة فوراً ومحملة بخصائص رخصة المؤسسات (\`ACTIVE_ENTERPRISE_UNLIMITED\`).

2. **التفعيل المباشر عبر ملف التكوين البيئي (\`.env\`):**
   حقن المتغيرات البيئية لفرض تمرير الميزات بنجاح:
   \`\`\`env
   BYPASS_EXPIRE_CHECK=true
   TRIAL_MODE=false
   LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
   \`\`\`
   هذا يعطل فحص ملفات عداد الوقت وساعة النظام بالكامل ويبقي قنوات البث ومحرك التلفاز يعمل بأقصى طاقة استيعابية بشكل مجاني وأبدي.`
      }
    ]
  },
  {
    id: 'api_license_hwid_ar',
    title: 'تحليل معالجة البصمة الفيزيائية للعتاد (HWID API)',
    lang: 'ar',
    description: 'تشريح مستقل وميكروسكوبي لمعالج الـ HWID المترجم، وتحليل مشكلة تغير البصمة الفيزيائية لشبكة Docker وحلول تثبيتها للأبد.',
    sections: [
      {
        id: 'api_hwid_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج البصمة الفيزيائية للعتاد',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/license/hwid\`** الركن الأمني الحرج المسؤول عن استخراج، وتوليد، وفحص **البصمة الفيزيائية الفريدة للجهاز (Hardware Identifier - HWID)** الخاص بخادم منصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط \`/api/license/hwid\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي المكتوب بلغة JavaScript للإنتاج والمحتوي على خوارزمية استعلام نظام التشغيل عن عتاد الجهاز.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد (Node File Trace) والمسؤول عن ربط مكتبات وعمليات الاستعلام منخفضة المستوى المادية للعتاد.`
      },
      {
        id: 'api_hwid_challenges',
        title: '٢. معضلة الـ HWID في بيئات الحاويات الافتراضية (QNAP NAS / Docker)',
        content: `تمثل خوارزمية توليد البصمة الفيزيائية للعتاد عائقاً حاداً يهدد استقرار الخدمة في بيئة حاويات **Docker** على سيرفرات **QNAP NAS**:
1. **تغير عناوين الماك الافتراضية:** عند إعادة بناء حاويات Docker، يتغير عنوان الماك (MAC Address) الافتراضي للحاوية، مما يؤدي فوراً لتغير البصمة الفيزيائية للجهاز وتوقف رخصة البث المباشر.
2. **عزل نواة الحاوية وغياب صلاحيات Root:** تعجز الحاويات المعزولة غالباً عن قراءة تفاصيل البيوس أو عتاد المذربورد من نظام لينكس المضيف، مما يسبب نتائج غير مستقرة تؤثر على ثبات رخص التشغيل.`
      },
      {
        id: 'api_hwid_bypass',
        title: '٣. دليل كسر حظر البصمة المادية وتثبيتها للأبد للمؤسسات',
        content: `لضمان بقاء البصمة الفيزيائية للعتاد ثابتة بنسبة 100% ومنع تأثر المنصة بإعادة تشغيل الحاويات:

1. **التحايل والاعتراض عبر المخدم الرئيسي (\`server.js\`):**
   نقوم باعتراض طلبات الرابط \`/api/license/hwid\` فوراً عبر خادم Express الرئيسي وإرجاع بصمة فيزيائية موحدة وثابتة:
   \`\`\`javascript
   app.get('/api/license/hwid', (req, res) => {
       return res.status(200).json({
           hwid: "MUBASHER_STREAM_ENTERPRISE_STATIC_HARDWARE_SIGNATURE_2026_OK",
           stable: true,
           environment: "Docker Container Host (QNAP NAS Security Isolated)"
       });
   });
   \`\`\`

2. **التثبيت الفوري عبر المتغيرات البيئية (\`.env\`):**
   تمرير متغير بيئي لفرض هوية موحدة لعتاد الحاوية:
   \`\`\`env
   FORCE_STATIC_HWID="MUBASHER_STREAM_ENTERPRISE_STATIC_HARDWARE_SIGNATURE_2026_OK"
   BYPASS_EXPIRE_CHECK=true
   \`\`\`
   هذا الإجراء يضمن استقراراً مطلقاً للمنصة في بيئات كيوناب، ويسمح بالترخيص السلس والتكامل المستقر مع كافة ميزات البث والتحويل.`
      }
    ]
  },
  {
    id: 'api_license_update_ar',
    title: 'تحليل معالجة تحديث وتنشيط التراخيص (Update API)',
    lang: 'ar',
    description: 'تشريح ميكروسكوبي مستقل لمعالج تحديث التراخيص المترجم، وتحليل مشكلة تخزين رخصة التنشيط في الحاويات المغلقة وطرق ترويضها للأبد.',
    sections: [
      {
        id: 'api_update_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج تحديث التراخيص المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/license/update\`** الصمام البرمجي الخلفي المسؤول عن استقبال، ومعالجة، وحفظ طلبات **تحديث وتنشيط رخص التشغيل (License Key Update & Activation)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط \`/api/license/update\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن استلام وحفظ وتحديث رزم التراخيص.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد (Node File Trace) والمسؤول عن ربط مكتبات وعمليات الكتابة الفيزيائية وتحديث ملفات النظام.`
      },
      {
        id: 'api_update_challenges',
        title: '٢. معوقات تحديث التراخيص في بيئات Docker المغلقة (QNAP NAS)',
        content: `عند ترحيل مباشر ستريم إلى خوادم التخزين الشبكي **QNAP NAS** عبر حاويات **Docker**:
1. **طبيعة نظام الملفات للقراءة فقط:** تفرض حاويات Docker أحياناً قيوداً تمنع الكتابة مادية على الملفات، مما يفشل كتابة ملف الترخيص الجديد أو تعديل مستند \`.env\` وينهار المخدم بالخطأ 500.
2. **زوال التغييرات عند إعادة التشغيل:** حتى لو نجحت الحاوية بالكتابة، فإن زوال بيئة الحاوية المفتتة عند إعادة التشغيل يعيد المنصة للوضع غير المفعل ويوقف البث المباشر.`
      },
      {
        id: 'api_update_bypass',
        title: '٣. دليل كسر القيود والأتمتة الدائمة لتحديث التراخيص للأبد',
        content: `لتخطي كافة التعقيدات المادية وضمان نجاح عمليات التحديث والحفظ بشكل وهمي ومستقر للأبد ومقاوم لإعادة التشغيل:

1. **الاعتراض عبر المخدم الرئيسي (\`server.js\`):**
   نقوم باعتراض طلبات الرابط \`/api/license/update\` فوراً عبر خادم Express الرئيسي وإرجاع نجاح دائم ومباشر برخصة غير محدودة للمؤسسات:
   \`\`\`javascript
   app.post('/api/license/update', express.json(), (req, res) => {
       return res.status(200).json({
           success: true,
           message: "تم تفعيل وتحديث رخصة منصة مباشر ستريم بنجاح فائق!",
           expiresAt: "Unlimited Perpetual (Enterprise Mode)",
           owner: "Enterprise Authorized Partner (QNAP NAS Host)"
       });
   });
   \`\`\`

2. **عبر ربط المجلدات المشتركة لـ Docker (Volumes Binding):**
   تأمين بقاء ملفات الترخيص الفعلية خارج زوال الحاوية بربطها بمسار حقيقي ومحفوظ على أقراص تخزين QNAP NAS:
   \`\`\`yaml
   volumes:
     - /share/CACHEDEV1_DATA/MubasherStream/config/.env:/app/.env
     - /share/CACHEDEV1_DATA/MubasherStream/config/.license.jwt:/app/.license.jwt
   \`\`\`
   هذه الاستراتيجية توفر أماناً واستقراراً لا غبار عليه طيلة فترات الخدمة والتشغيل.`
      }
    ]
  },
  {
    id: 'api_live_ar',
    title: 'تحليل معالجة البث الحي وقنوات IPTV (Live API)',
    lang: 'ar',
    description: 'تشريح مستقل ومعمق لمعالج البث الحي وتدفقات الفيديو، واستراتيجيات التغلب على قيود الترخيص لضمان عدم انقطاع البث.',
    sections: [
      {
        id: 'api_live_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج البث الحي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/live\`** الركيزة الأساسية لإدارة **حالة البث المباشر (Live Stream Status)**، مراقبة الجلسات الحية (Active Connections Tracker)، والتحكم بمسارات معالجة وتدفق قنوات الـ IPTV في بيئة الإنتاج تحت المسار \`/api/live\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن مراقبة جلسات البث المباشر وقراءة العمليات الجارية.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد (Node File Trace) لربط مكتبات معالجة البث وتحويل الجودات مادية.`
      },
      {
        id: 'api_live_challenges',
        title: '٢. معوقات معالجة البث الحي في بيئات QNAP NAS وحاويات Docker',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تبرز تحديات هيكلية مباشرة:
1. **الوصول لمحرك FFmpeg:** يعتمد كود المعالج على استدعاء أمر \`ffmpeg\` من نظام التشغيل. يجب التأكد من تثبيت حزمة FFmpeg بداخل الحاوية ذاتها وتوريث المسار الصحيح له عبر متغير البيئة \`FFMPEG_PATH\`.
2. **عزل منافذ الشبكة:** تحتاج بروتوكولات البث المباشر (مثل RTMP على منفذ 1935 أو HLS) لتصدير المنافذ وتمريرها مباشرة (Port Forwarding) من حاوية Docker لشبكة QNAP NAS الفيزيائية.`
      },
      {
        id: 'api_live_bypass',
        title: '٣. دليل كسر القيود وضمان استقرار معالج البث للأبد',
        content: `لضمان عمل معالج البث المباشر بنجاح 100% ودون تأثر بالقيود الزمنية أو قيود التراخيص، يتم تمرير معايير التخطي للنسخة التجريبية كقيمة صحيحة دائمة بملف التكوين البيئي للحاوية (\`.env\`):
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا الإجراء يضمن عدم انقطاع البث، وتدفق القنوات بسلاسة فائقة، وعمل محاكي التلفزيون الذكي ولوحة التحكم بكفاءة متناهية وبلا حدود زمنية.`
      }
    ]
  },
  {
    id: 'api_mikrotik_ar',
    title: 'تحليل ربط شبكات ميكروتك وإدارة المشتركين (MikroTik API)',
    lang: 'ar',
    description: 'تشريح مستقل وعميق لمجلد ربط شبكات ميكروتك وإدارة المشتركين، وحلول مشاكل عزل المقابس وحظر التراخيص.',
    sections: [
      {
        id: 'api_mikrotik_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج ربط ميكروتك المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/mikrotik\`** النواة المسؤولة عن معالجة وتمرير عمليات **الربط والتحكم بشبكات وأجهزة MikroTik RouterOS** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/mikrotik\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمسؤول عن ربط وإرسال الأوامر البرمجية (RouterOS API Commands) لأجهزة ميكروتك وتعديل جدران الحماية وسرعات البث.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات ومقابس الاتصالات الشبكية والـ TCP.`
      },
      {
        id: 'api_mikrotik_challenges',
        title: '٢. معوقات ربط ميكروتك في بيئات الحاويات الافتراضية (Docker / QNAP NAS)',
        content: `عند ترحيل مباشر ستريم إلى حاويات Docker على سيرفرات **QNAP NAS**، تظهر عقبة شبكية تؤثر على الاتصال:
1. **مشكلة عزل شبكة الحاوية الافتراضية:** تعمل حاويات Docker خلف شبكة داخلية معزولة، مما يمنع الحاوية من الاتصال المباشر براوتر ميكروتك المحلي.
   * **الحل الفني:** يجب تشغيل حاوية مباشر ستريم بوضعية الشبكة المضيفة (\`network_mode: host\`) بداخل إعدادات Docker Compose، مما يتيح للحاوية مشاركة عنوان الـ IP الفعلي لـ QNAP NAS والوصول المباشر للراوتر.`
      },
      {
        id: 'api_mikrotik_bypass',
        title: '٣. دليل كسر القيود والأتمتة لربط شبكات ميكروتك للأبد',
        content: `تعتبر ميزة ربط ميكروتك من أهم الخصائص التجارية التي تطلب رخص مؤسسات نشطة، ولضمان عملها بنجاح وبلا قيود زمنية، نقوم بحقن التمكين اللامتناهي عبر المتغيرات البيئية لـ Docker container لكسر حظر الترخيص:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يوفر قدرة كاملة على التحكم بالسرعات الديناميكية (Simple Queues) وحسابات الـ Hotspot للمشتركين بأبسط صورة ممكنة.`
      }
    ]
  },
  {
    id: 'api_notifications_ar',
    title: 'تحليل معالجة الإشعارات والإنذارات البرمجية (Notifications API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد معالجة الإشعارات والتحذيرات المترجم، وتوصيات ربط المجلدات المشتركة لـ Docker لمنع زوال السجلات.',
    sections: [
      {
        id: 'api_notifications_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج الإشعارات المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/notifications\`** الجهاز العصبي المسؤول عن إدارة وتوزيع **إشعارات وتنبيهات النظام (System Notifications & Warnings)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/notifications\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن معالجة وإرسال الرسائل والتنبيهات للعملاء وتوجيهها لخدمات تيليجرام أو البريد الإلكتروني.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات إرسال الرسائل عبر الويب (مثل حزم SMTP و Axios).`
      },
      {
        id: 'api_notifications_challenges',
        title: '٢. معوقات عمل الإشعارات في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS**، تظهر عقبة فيزيائية حيوية تؤثر على ثبات وحفظ الإشعارات:
1. **مشكلة التخزين الزائل:** يتم قراءة وكتابة الإشعارات محلياً في مستند JSON على المسار \`data/notifications.json\`. عند زوال الحاوية أو إعادة تشغيلها، يتم مسح كافة سجلات الإشعارات والتنبيهات التاريخية.
   * **توصية هجرة البيانات الفنية:** يجب ربط مجلد البيانات بمسار تخزين فيزيائي على أقراص QNAP NAS عبر تفعيل ميزة المجلدات المشتركة بداخل مستند Docker Compose:
     \`\`\`yaml
     volumes:
       - /share/CACHEDEV1_DATA/MubasherStream/data:/app/data
     \`\`\`
     هذا يحافظ على التنبيهات وقوائم المستخدمين وتاريخ الإشعارات محفوظاً ومحمياً بنسبة 100% طيلة فترات الخدمة.`
      },
      {
        id: 'api_notifications_bypass',
        title: '٣. دليل كسر القيود والأتمتة لإشعارات وتنبيهات مباشر ستريم',
        content: `لضمان عدم تداخل التنبيهات التحذيرية المزعجة والخاصة بانتهاء النسخة التجريبية داخل لوحة التحكم وجعل الواجهة نقية وصافية تماماً ومهيأة للتشغيل المؤسسي المفتوح للأبد، يتم صياغة المتغيرات البيئية لـ Docker container لقمع تنبيهات الفشل وإظهار حالة التنشيط الدائمة للأبد:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يمنع توجيه أي تحذيرات ترخيص مزعجة لقنوات تيليجرام أو البريد الإلكتروني ويضمن هدوءاً وثباتاً تشغيلياً مطلقاً.`
      }
    ]
  },
  {
    id: 'api_schedules_ar',
    title: 'تحليل معالجة المهام المجدولة والكرون (Schedules API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد معالجة المهام والعمليات المجدولة المترجم، وتوصيات تعديل المنطقة الزمنية للحاويات للتسيير التلقائي السليم.',
    sections: [
      {
        id: 'api_schedules_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج المهام المجدولة المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/schedules\`** النواة المكلفة بإدارة وجدولة وتوقيت **المهام والعمليات التلقائية في الخلفية (Automated Background Tasks & Cron Jobs)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/schedules\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن إدارة وتوقيت جداول المهام والكرون (مثل تحديث قوائم IPTV ومزامنة EPG).
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات الجدولة الزمنية مادية.`
      },
      {
        id: 'api_schedules_challenges',
        title: '٢. معوقات الجدولة التلقائية في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تبرز تحديات برمجية تعيق انتظام عمل المهام المجدولة:
1. **انحراف التوقيت والمنطقة الزمنية للحاوية:** تعمل حاويات Docker بشكل افتراضي بتوقيت جرينتش العالمي (UTC)، مما يجعل مهام الكرون تنطلق في أوقات خاطئة.
   * **الحل الفني لـ QNAP:** يجب حقن متغير تحديد المنطقة الزمنية الصحيحة بداخل ملف \`docker-compose.yml\` (مثال: \`TZ=Asia/Riyadh\`).
2. **فقدان تراكم السجلات لقنوات البث:** لتجنب فقدان قوائم القنوات المحدثة تلقائياً عند إعادة تشغيل الحاوية، يجب ربط مجلد البيانات بمسار فيزيائي آمن على القرص الصلب لـ QNAP NAS.`
      },
      {
        id: 'api_schedules_bypass',
        title: '٣. دليل كسر القيود والأتمتة لجدولة المهام للأبد',
        content: `لضمان بقاء عمليات التحديث ومزامنة قنوات IPTV وقوائم البرامج فعالة وخارج قيود التراخيص، يتم تمرير معايير التخطي للنسخة التجريبية كقيمة صحيحة دائمة بملف التكوين البيئي للحاوية (\`.env\`):
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يوفر تسييراً تلقائياً لعمليات سحب التحديثات وإعادة تحميل القنوات بكفاءة متناهية وبلا حدود زمنية.`
      }
    ]
  },
  {
    id: 'api_servers_ar',
    title: 'تحليل إدارة الخوادم وعناقيد البث الموزعة (Servers API)',
    lang: 'ar',
    description: 'تشريح مستقل وعميق لمجلد معالجة عناقيد البث وخوادم التوزيع المترجم، وحل مشاكل توجيه حركات مرور الفيديو في حاويات QNAP.',
    sections: [
      {
        id: 'api_servers_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج الخوادم العنقودية المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/servers\`** النواة المكلفة بمعالجة وإدارة **عناقيد الخوادم والربط المتعدد لمجموعات البث (Load Balancing & Clustering Node Controllers)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/servers\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمكلف بمراقبة وتوزيع المهام واستعلام حيوية الخوادم الفرعية (Edge Nodes) الموصولة بالخادم الرئيسي (Master Node).
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات فحص حيوية الشبكة وقياس زمن الاستجابة.`
      },
      {
        id: 'api_servers_challenges',
        title: '٢. معوقات توزيع الخوادم في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند ترحيل مباشر ستريم لتشغيلها كعنقود خوادم موزع في بيئة حاويات Docker على سيرفرات **QNAP NAS**:
1. **مشكلة التوجيه الشبكي وعزل جدار الحماية للحاوية:** تفشل الخوادم الفرعية في الاتصال بالخادم الرئيسي إذا تم تسجيله بـ IP افتراضي معزول للحاوية.
   * **الحل الفني والترحيل السليم:** يجب تسجيل الخوادم باستخدام عناوين الـ IP الحقيقية الفيزيائية للشبكة المحلية، وتصدير منافذ مباشر ستريم (منفذ 3000 للـ HTTP ومنفذ 1935 للـ RTMP) بملف Docker Compose لضمان تلقي المقابس وتوجيه حركة مرور الفيديو بسلاسة.`
      },
      {
        id: 'api_servers_bypass',
        title: '٣. دليل كسر القيود والأتمتة لتشغيل عناقيد البث للأبد',
        content: `تعتبر ميزة تمدد الخوادم وبناء شبكة توزيع بث ميزة تجارية مخصصة للمؤسسات الكبرى (Enterprise Plan)، ولضمان بقائها نشطة ومفعلة للأبد وبلا قيود تجريبية، نقوم بصياغة المتغيرات البيئية لـ Docker container لتخطي قيود التحقق من الرخص قسرياً:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا التمرير يكسر حظر الرخص ويؤمن البث المتزامن لآلاف المشاهدين بشكل مجاني وثابت وبأقصى طاقة استيعابية.`
      }
    ]
  },
  {
    id: 'api_settings_ar',
    title: 'تحليل معالجة إعدادات وتكوين المنصة (Settings API)',
    lang: 'ar',
    description: 'تشريح مستقل ومعمق لمجلد إعدادات وتكوينات المنصة المترجم، وأهمية ربط المجلدات المشتركة لمنع فقدان التعديلات وتفضيلات FFmpeg.',
    sections: [
      {
        id: 'api_settings_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج إعدادات المنصة المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/settings\`** مركز التحكم الأساسي لوحدة الإدارة والتهيئة الرقمية، والمسؤول الفعلي عن معالجة، وحفظ، وتعديل **إعدادات المنصة الشاملة وملفات التكوين (System Configuration & Global Settings)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/settings\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن قراءة وتعديل وحفظ ملفات التكوين والإعدادات العامة للخادم ومحركات البث.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات معالجة البيانات والكتابة على مستندات التكوين مادية.`
      },
      {
        id: 'api_settings_challenges',
        title: '٢. معوقات عمل وحفظ الإعدادات في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS**، تظهر عقبة فيزيائية حيوية تؤثر على ثبات الإعدادات:
1. **مشكلة زوال التعديلات وحفظ التكوينات:** تُخزن الإعدادات محلياً بملف تكوين مادي (\`config/settings.json\`). بمجرد إعادة تشغيل الحاوية أو تحديثها، تُمسح التعديلات وتفقد المنصة قنوات البث المضافة وتفضيلات الترانسكودينج.
   * **توصية هجرة البيانات الذهبية لـ QNAP:** يجب ربط مجلد التكوينات بمسار دائم خارج نطاق الحاوية على أقراص QNAP NAS الحقيقية بداخل مستند Docker Compose:
     \`\`\`yaml
     volumes:
       - /share/CACHEDEV1_DATA/MubasherStream/config:/app/config
     \`\`\`
     هذا يضمن حماية الإعدادات وقنوات البث المضافة وقواعد التحويل طيلة فترة تشغيل المنصة.`
      },
      {
        id: 'api_settings_bypass',
        title: '٣. دليل كسر القيود والأتمتة لإعدادات وتفضيلات مباشر ستريم',
        content: `لضمان عمل لوحة التحكم بالكامل وبقاء نافذة تعديل الإعدادات والخيارات مفتوحة وفعالة للأبد، دون مواجهة إيقاف أو تعطيل مؤشر التحديث بسبب صمامات النسخة التجريبية، نمرر متغيرات البيئة لفرض التجاوز:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحظر تماماً ظهور رسائل انتهاء الفترة التجريبية ويمنح المدير مرونة مطلقة للتحكم الشامل بخصائص الخادم للأبد.`
      }
    ]
  },
  {
    id: 'api_status_ar',
    title: 'تحليل معالجة حالة النظام العامة (Status API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد معالجة حالة النظام العامة والصحة التشغيلية، وحلول تقدير الموارد بداخل بيئة الحاويات لـ QNAP.',
    sections: [
      {
        id: 'api_status_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج الحالة العامة المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/status\`** الركيزة المخصصة لتقديم **تقرير الحالة الصحية العامة للنظام (System Health & Pulse Report API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/status\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمسؤول عن تجميع وإرجاع الحالة الصحية العامة للمنصة (مثل الـ Database, Memory, CPU, Uptime).
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات فحص موارد الخادم وصمامات الترخيص مادية.`
      },
      {
        id: 'api_status_challenges',
        title: '٢. معوقات قياس الحالة في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تبرز تحديات برمجية تعيق دقة التقارير:
1. **انحراف بيانات موارد المعالج (Host vs. Container Limits):** قد ترجع قيم الذاكرة والمعالج الإجمالية للسيرفر كاملاً وليس المخصصة للحاوية فقط.
   * **توصية ترحيل البيانات الفنية:** يجب تحديد حدود صلبة (Limits) للرام والمعالج للحاوية بداخل ملف \`docker-compose.yml\` لتلافي استهلاك موارد جهاز التخزين بالكامل أثناء الترانسكودينج ثقيل العبء.`
      },
      {
        id: 'api_status_bypass',
        title: '٣. دليل كسر القيود والأتمتة لمعالج الحالة العامة للأبد',
        content: `لضمان بقاء تقرير الحالة العامة نظيفاً وخالياً من رسائل توقف التراخيص أو فترات التجربة، نقوم بصياغة المتغيرات البيئية لـ Docker container لفرض تجاوز القيود وعمل النظام كنسخة مؤسسات لا نهائية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يلغي صمامات الإغلاق ويجعل الخادم يعمل بكفاءة تشغيلية مطلقة للأبد.`
      }
    ]
  },
  {
    id: 'api_stream_ping_ar',
    title: 'تحليل نبض البث والحفاظ على الجلسات (Stream Ping API)',
    lang: 'ar',
    description: 'تشريح مستقل ومعمق لمجلد معالجة إشارات نبض البث وتوفير الباندويث والموارد، والحلول الفنية للكتابة التكرارية على الأقراص بكيوناب.',
    sections: [
      {
        id: 'api_stream_ping_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج نبض البث المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/stream/ping\`** العصب المخصص لعمليات **نبض البث والحفاظ على قنوات التحويل نشطة (Stream Heartbeat & Auto-Shutdown Session Keep-Alive)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/stream/ping\`.`
      },
      {
        id: 'api_stream_ping_challenges',
        title: '٢. معوقات الحفاظ على نبض البث في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS**، تبرز تحديات متعلقة بمقابس الاتصال والكتابة على الأقراص:
1. **انحراف مقابس الاتصال والـ Reverse Proxy:** قد تقطع خوادم الويب اتصالات التحديث المتتالية السريعة بوجود جدران حماية نشطة.
2. **الكتابة المتكررة وتآكل أقراص الـ SSD:** تقوم عملية الـ Ping بتحديث الكاش باستمرار على الهارد ديسك لتتبع المشاهدين النشطين.
   * **توصية هجرة البيانات الفنية:** يفضل الاعتماد على كتل كاش سريعة بالذاكرة العشوائية وتمرير اتصالات Websockets مباشرة عبر الـ Proxy دون جدران حماية.`
      },
      {
        id: 'api_stream_ping_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء البث المباشر نشطاً للأبد',
        content: `لضمان بقاء نبض البث وخدمات الحفاظ على الجلسات مستجيبة ومحمية بنسبة 100% ودون توقف مفاجئ للتحويل، نمرر متغيرات بيئة التخطي لـ Docker container:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحمي محرك البث ويحافظ على استهلاك الباندويث عبر تفعيل خاصية الإيقاف التلقائي الذكي عند خروج المشاهدين بلا حدود تراخيص زمنية.`
      }
    ]
  },
  {
    id: 'favicon_ar',
    title: 'تحليل الأيقونة الرمزية وهوية العلامة التجارية المترجمة (Favicon Route)',
    lang: 'ar',
    description: 'تشريح مستقل وفني لمعالج الأيقونة الرمزية للمنصة بالمتصفحات، وضمان ثبات الهوية البصرية بداخل حاوية كيوناب.',
    sections: [
      {
        id: 'favicon_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد favicon.ico المترجم',
        content: `يمثل الملف والمجلد **\`MubasherStream/app/.next/server/app/favicon.ico\`** الركيزة الفنية لـ **الأيقونة الرمزية وهوية العلامة التجارية لمتصفحات الويب (Brand Favicon Identity & Dynamic Asset Router)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/favicon.ico\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمكلف بتغذية وتمرير ملف الأيقونة الرمزية بترميز ثنائي للمتصفحات وضبط ترويسات الكاش.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مسار الصورة المادية بذاكرة الخادم الفورية.`
      },
      {
        id: 'favicon_challenges',
        title: '٢. معوقات الأيقونة الرمزية والتحميل في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز بعض التحديات بالهوية البصرية:
1. **أخطاء الترويسة والصيغة خلف خوادم الـ Proxy:** قد يرفض متصفح الويب عرض الأيقونة إذا افتقرت لترويسة نوع البيانات الصارمة (\`Content-Type: image/x-icon\`).
2. **استبدال شعار وهوية المنصة المخصصة:** لضمان ثبات الأيقونات والشعارات المخصصة التي يضيفها المدير بعد إعادة بناء الحاوية، يجب ربط مجلد الملفات العامة (\`/app/public\`) بمسار دائم بالهارد ديسك خارج الحاوية.`
      },
      {
        id: 'favicon_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء هوية قنوات IPTV مفعلة للأبد',
        content: `لضمان بقاء هوية المنصة سليمة ومتاحة للأبد وبلا انقطاع أو حظر تراخيص، نقوم بتغذية الحاوية بالمتغيرات البيئية لكسر حظر القيود الزمنية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحافظ على التواجد الدائم للأيقونات وشعارات المنصة التجارية للأبد.`
      }
    ]
  },
  {
    id: 'api_imgs_slug_ar',
    title: 'تحليل معالج الصور والرموز الديناميكي المترجم (Imgs Slug Route)',
    lang: 'ar',
    description: 'تشريح مستقل وفني لمعالج الصور والرموز والشعارات لـ IPTV، وحلول تفادي تبخر الأصول وصلاحيات القراءة بكيوناب.',
    sections: [
      {
        id: 'api_imgs_slug_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد معالج الصور الديناميكي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/imgs/[...slug]\`** الركيزة الفنية لـ **معالجة وتوريد شعارات وصور القنوات الديناميكية (Dynamic Catch-All Images & Channel Icons Routing Gateway)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الديناميكي \`/imgs/[...slug]\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الديناميكي المسؤول عن قراءة وتمرير تدفق بايتات الصور الثنائية وتعيين نوعها بدقة.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مسارات تخزين الصور والملفات الثابتة بالنظام.`
      },
      {
        id: 'api_imgs_slug_challenges',
        title: '٢. معوقات معالجة وتخديم الصور في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز تحديات متعلقة بثبات شعارات القنوات:
1. **مشكلة تبخر شعارات وصور القنوات المضافة:** تُمسح كافة الشعارات المرفوعة محلياً عند زوال الحاوية أو إعادة تشغيل السيرفر.
   * **الحل الفني والترحيل السليم:** ربط مسار حفظ الشعارات بالكامل (\`/app/public/assets/images\`) بمجلد تخزين دائم وفيزيائي خارج الحاوية على خادم QNAP.
2. **مشكلة صلاحيات القراءة والكتابة:** ضبط معطيات UID و GID بداخل الحاوية لتتطابق مع صلاحيات مستخدم كيوناب، لتجنب حدوث أخطاء Permission Denied.`
      },
      {
        id: 'api_imgs_slug_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء معالج الصور نشطاً للأبد',
        content: `لضمان استمرار خدمة الصور والشعارات للأبد وبلا انقطاع أو حظر تراخيص، نغذي الحاوية بالمتغيرات البيئية الفورية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يلغي صمامات الإغلاق ويجعل تصفح وجلب شعارات القنوات يعمل بأعلى استقرار.`
      }
    ]
  },
  {
    id: 'api_locked_ar',
    title: 'تحليل شاشة القفل وتعليق المنصة المترجم (Locked Route)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد وبنية شاشة الحظر والحساب المعلق، وحلول تضارب التوجيه وحصار الملفات بكيوناب.',
    sections: [
      {
        id: 'api_locked_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد شاشة القفل المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/locked\`** الركيزة الفنية لـ **صفحة حظر الخدمة وشاشة الحساب المعلق أو المنتهي الصلاحية (Platform Lockout & Licence Suspension Screen Engine)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط المباشر \`/locked\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود الصفحة المترجم والمسؤول عن بناء وتصميم الهيكل العام والواجهة الرسومية لصفحة تعليق المنصة.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المكونات المرئية وحقول إدخال الرخص بصفحة الحظر.`
      },
      {
        id: 'api_locked_challenges',
        title: '٢. معوقات شاشة القفل والتعليق في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز تحديات فنية مع صمامات الحظر:
1. **مشكلة الحصار والتعليق اللانهائي:** قد تفشل عملية كتابة مفاتيح الترخيص الجديدة المرفوعة من الواجهة إذا كانت الحاوية تفتقر لصلاحيات الكتابة على الأقراص المضيفة.
   * **الحل الفني والترحيل السليم:** ربط مسار حفظ ملفات الرخصة وقاعدة البيانات بمسار تخزين فيزيائي متاح للكتابة خارج الحاوية على سيرفر كيوناب.
2. **مشكلة تضارب التوجيه وخداع المتصفحات:** لتفادي بقاء شاشة الحظر معروضة بالخطأ نتيجة كاش المتصفحات، نلغي التخزين المؤقت لصفحة القفل كلياً.`
      },
      {
        id: 'api_locked_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء المنصة مفتوحة للأبد دون شاشة الحظر',
        content: `لكسر قيود التراخيص تماماً وتجنب ظهور شاشة القفل والتعليق الحمراء أمام المستخدمين، نقوم بحقن صمامات التخطي الدائمة بالبيئة:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحمي الخادم ويضمن عدم تفعيل شاشة القفل وتحويل الزوار فوراً للواجهة الرئيسية المفتوحة للأبد.`
      }
    ]
  },
  {
    id: 'api_login_ar',
    title: 'تحليل صفحة تسجيل الدخول وإدارة الهوية المترجم (Login Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد صفحة تسجيل دخول المديرين وإصدار تذاكر الأمان، وحلول فقدان الجلسة وتمرير عناوين الزوار بكيوناب.',
    sections: [
      {
        id: 'api_login_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد بوابة تسجيل الدخول المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/login\`** البوابة الفنية والمسؤول الأول عن **صفحة وبوابة تسجيل دخول المستخدمين والمديرين (User Authentication Interface & Login Route Handler)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط المباشر \`/login\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة تسجيل الدخول المترجم والمسؤول عن رندر واجهة حقول إدخال اسم المستخدم وكلمة السر وتدقيق الصلاحية.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المكونات المرئية وحزم التوثيق والتشفير الآمن بذاكرة الخادم.`
      },
      {
        id: 'api_login_challenges',
        title: '٢. معوقات صفحة تسجيل الدخول في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تظهر تحديات بوابات الأمان والتوثيق:
1. **فقدان جلسة تسجيل الدخول بشكل متكرر عند إعادة التشغيل:** تفقد الحاوية بذور التشفير العشوائية بمجرد إعادة البناء مما يطرد المديرين النشطين.
   * **الحل الفني والترحيل السليم:** تعيين متغير بيئي ثابت وثابت يسمى \`JWT_SECRET\` بداخل ملف \`.env\` لتوحيد مفاتيح الأمان والتوثيق.
2. **مشكلة الحظر التلقائي للبروكسي بالخطأ:** لتجنب حظر عنوان الآي بي الداخلي لـ Docker Gateway، نمرر العناوين الحقيقية للزوار (\`X-Forwarded-For\`) خلف خوادم البروكسي.`
      },
      {
        id: 'api_login_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء بوابة الدخول نشطة للأبد',
        content: `لضمان بقاء ميزات الدخول والتحقق سليمة ومتاحة للأبد وبلا فترات تجريبية أو قيود تراخيص، نغذي ملف التكوين بقيم التخطي الفوري:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يزيل صمامات الإغلاق ويجعل لوحة الإدارة ومصادقة المستخدمين تعمل بأقصى كفاءة استقرار.`
      }
    ]
  },
  {
    id: 'api_mubasher_admin_about_ar',
    title: 'تحليل صفحة معلومات المنصة وإصدارات الخادم المترجم (Admin About Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد صفحة حول المنصة وتعريف الإصدارات والترخيص، ومشاكل قراءة العتاد الحقيقي بكيوناب.',
    sections: [
      {
        id: 'api_mubasher_admin_about_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد معلومات المنصة المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/mubasher_admin/about\`** الركيزة المخصصة لـ **صفحة تفاصيل وإصدار ومعلومات منصة البث (Admin System Information & About Platform UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الآمن \`/mubasher_admin/about\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة معلومات المنصة والنسخة المترجم والمسؤول عن رندر تفاصيل المطورين وحزم البرمجيات والخادم.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المعالجات المرئية ومخططات حالة خادم مباشر ستريم.`
      },
      {
        id: 'api_mubasher_admin_about_challenges',
        title: '٢. معوقات صفحة معلومات المنصة في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز عقبات تقنية مع صفحة حول المنصة:
1. **انحراف مواصفات العتاد المعروضة بالواجهة:** يقرأ كود Node.js الافتراضي مواصفات الحاوية المعزولة وليس مواصفات سيرفر كيوناب الفيزيائي.
   * **الحل الفني والترحيل السليم:** توجيه مباشر ستريم لقراءة إحصائيات المعالج الحقيقي والرامات عبر استعلام مباشر لواجهة QNAP API الرسمية.
2. **بطء تحميل الصفحة بسبب فحص التحديثات التلقائي:** ينصح بإيقاف الاستعلام التلقائي الخارجي وتحديث الحاوية يدوياً لتفادي مشاكل الحجب الناري بكيوناب.`
      },
      {
        id: 'api_mubasher_admin_about_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء صفحة معلومات المنصة مفتوحة للأبد',
        content: `لمكافحة تجميد واجهات ومعلومات المنصة أمام المسؤولين وتأمين العرض المستمر لإصدار السيرفر المفتوح، نمرر المتغيرات البيئية لكسر حظر القيود الزمنية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحافظ على التواجد الدائم وإظهار الترخيص غير المحدود (Unlimited Perpetual) للأبد.`
      }
    ]
  },
  {
    id: 'api_mubasher_admin_backup_ar',
    title: 'تحليل صفحة النسخ الاحتياطي واستعادة البيانات المترجم (Admin Backup Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد إدارة تصدير واستيراد ملفات القنوات والتراخيص، وحلول محدودية الرفع وصلاحيات فك الضغط بكيوناب.',
    sections: [
      {
        id: 'api_mubasher_admin_backup_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد النسخ الاحتياطي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/mubasher_admin/backup\`** الركيزة الفنية لـ **صفحة إدارة عمليات النسخ الاحتياطي واستعادة التكوينات وقنوات IPTV (Platform Configuration Backup & Database Restore UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الآمن \`/mubasher_admin/backup\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة النسخ الاحتياطي واستيراد وتصدير قواعد البيانات المترجم والمسؤول عن ربط وظائف الحفظ والتنزيل.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات ومحركات ضغط الأرشيف والـ Zip بالنظام.`
      },
      {
        id: 'api_mubasher_admin_backup_challenges',
        title: '٢. معوقات النسخ الاحتياطي واستعادة البيانات في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز تحديات مادية تعيق حماية البيانات:
1. **تبخر ملفات النسخ المتولدة وصعوبة رفع الملفات الضخمة:** قد تفشل عملية الاستيراد بسبب قيود حجم الرفع لـ Nginx Docker Bridge.
   * **الحل الفني والترحيل السليم:** حفظ النسخ الاحتياطية المتولدة بمجلد تخزين دائم على هارد ديسك QNAP، وضبط قيمة \`client_max_body_size\` لـ 100 ميجا بايت بكيوناب.
2. **مشكلة صلاحيات فك الضغط أثناء الاستعادة:** يفضل إيقاف قراءة ملف القنوات مؤقتاً بالخلفية لضمان الاستبدال الكامل والخالي من الأخطاء والتشوهات.`
      },
      {
        id: 'api_mubasher_admin_backup_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء ميزات النسخ الاحتياطي نشطة للأبد',
        content: `لممنع حجب أدوات النسخ الاحتياطي واستعادة قنوات IPTV بسبب قيود الرخص والنسخ التجريبية، نقوم بحقن صمامات التخطي الدائمة في إعدادات الحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا التكوين يمنح المشرف صلاحيات أخذ النسخ الاحتياطية الآمنة واستعادتها بشكل مجاني ومفتوح للأبد.`
      }
    ]
  },
  {
    id: 'api_stream_status_ar',
    title: 'تحليل مراقبة حالة وجودة دفق الفيديو (Stream Status API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد معالجة ومراقبة حالة قنوات البث ومعدل الـ FPS، وحل مشكلة عزل العمليات للحاويات بكيوناب.',
    sections: [
      {
        id: 'api_stream_status_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج حالة دفق الفيديو المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/stream/status\`** الركيزة المخصصة لمراقبة **حالة معالجة دفق الفيديو وجودة تشغيل القنوات (Individual Stream Transcoding & Process Status Check)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/stream/status\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن مراقبة وقراءة تفاصيل دفق وعمل قنوات IPTV والـ FPS والـ Bitrate الحالي لعملية التحويل.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات فحص ومسح عمليات دفق الفيديو.`
      },
      {
        id: 'api_stream_status_challenges',
        title: '٢. معوقات قياس حالة دفق الفيديو في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز عقبات مادية متعلقة بملفات النظام:
1. **مشكلة عزل العمليات (Container Process Isolation):** تفشل الحاوية في مراقبة العمليات إذا كانت تعتمد على استدعاءات منخفضة المستوى للنظام (\`tasklist\` أو \`ps\`).
   * **الحل الفني والترحيل السليم:** تتبع العمليات ومعرفاتها (PIDs) ومخرجاتها محلياً بداخل كود التطبيق نفسه بدلاً من الاعتماد على عتاد النظام مباشرة.
2. **استهلاك الذاكرة المؤقتة (HLS Chunks Cache):** توليد ملفات دفق الـ HLS بداخل الهارد ديسك بكثافة قد يؤدي لامتلاء القرص وبطء المعالجة.
   * **توصية هجرة البيانات الفنية:** يفضل ربط مجلد الملفات المؤقتة للبث برام ديسك افتراضي (\`tmpfs\`) بداخل إعدادات الحاوية لسرعة فائقة ولمنع تآكل الهارد.`
      },
      {
        id: 'api_stream_status_bypass',
        title: '٣. دليل كسر القيود وضمان جودة دفق قنوات IPTV للأبد',
        content: `لمكافحة قيود انتهاء النسخ التجريبية وإتاحة القراءة اللحظية لمؤشرات دفق الفيديو وجودة القنوات للمشتركين دون توقف، نمرر التفعيل الفوري بقيم البيئة للحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يكسر صمامات التراخيص ويحافظ على استمرارية عرض إحصائيات الجودة والـ FPS لكافة القنوات للأبد.`
      }
    ]
  },
  {
    id: 'api_stream_test_ar',
    title: 'تحليل تشخيص وفحص مصادر البث وقنوات IPTV (Stream Test API)',
    lang: 'ar',
    description: 'تشريح مستقل وعميق لمجلد فحص صلاحية روابط القنوات وتشخيص الترميز، وتفادي مشاكل الوصول لأدوات ffprobe بكيوناب.',
    sections: [
      {
        id: 'api_stream_test_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج فحص مصادر البث المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/stream/test\`** الركيزة المخصصة لعمليات **فحص واختبار مصادر البث وتأكيد صلاحية روابط القنوات (Stream Diagnostic & Input Verification Test API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/stream/test\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن تشخيص مصادر البث وقراءة ترميز الفيديو والصوت والكوديكس باستخدام محركات الفحص.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات واستدعاء أدوات الـ FFprobe وقراءة التدفق البعيد.`
      },
      {
        id: 'api_stream_test_challenges',
        title: '٢. معوقات فحص روابط البث في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز معوقات متعلقة ببرامج التشخيص المساعد:
1. **الوصول لمستكشف الـ FFprobe:** تعتمد ميزة التشخيص كلياً على أداة \`ffprobe\`. إذا لم تكن الأداة مدمجة بداخل الحاوية فستفشل عمليات الاختبار وتظهر القنوات معطلة.
   * **الحل الفني والترحيل السليم:** استخدام صورة Docker أساسية تحتوي على كتل FFmpeg/FFprobe كاملة، وتوريث مسار المستكشف لمتغيرات البيئة (مثال: \`FFPROBE_PATH="/usr/bin/ffprobe"\`).
2. **جدران الحماية وحل الأسماء المحلية:** قد تفشل الحاوية المعزولة في فحص روابط البث المحلية بسبب قيود التوجيه الافتراضية للحاويات.`
      },
      {
        id: 'api_stream_test_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء ميزة تشخيص القنوات مفعلة للأبد',
        content: `لضمان استقرار ميزة تشخيص وفلترة مصادر قنوات IPTV وعملها بحرية تامة دون حجب الرخص أو انتهاء الصلاحيات، نمرر التمكين المفتوح بالمتغيرات البيئية لـ Docker:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يوفر للموزعين والمشرفين قدرة فائقة ومجانية على فلترة القنوات ومصادر البث المعطلة بسهولة تامة للأبد.`
      }
    ]
  },
  {
    id: 'api_stream_token_ar',
    title: 'تحليل حماية روابط وتشفير مسارات البث (Stream Token API)',
    lang: 'ar',
    description: 'تشريح مستقل ومعمق لمجلد توليد توكن تشفير قنوات البث ضد السرقة، وحل مشكلة عزل الـ IP للمشاهدين بداخل حاويات كيوناب.',
    sections: [
      {
        id: 'api_stream_token_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج حماية البث المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/stream/token\`** المسؤول عن **توليد وتأكيد رموز تشفير روابط البث ومكافحة السرقة (Secure Stream Tokenization & Anti-Leeching Protection API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/stream/token\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن توليد والتحقق من رموز البث المشفرة (HMAC-SHA256 أو JWT) لقنوات IPTV ومنع التشغيل الخارجي لغير المصرح لهم.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات التشفير والتواقيع الرقمية مادية.`
      },
      {
        id: 'api_stream_token_challenges',
        title: '٢. معوقات نظام حماية روابط البث في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تظهر تحديات خاصة بالتوجيه وتطابق عناوين الـ IP:
1. **مشكلة تطابق الـ IP خلف عتبة الـ NAT (Docker Bridge IP):** قد ترى الحاوية عناوين الـ IP الداخلية للـ Docker Bridge بدلاً من الـ IP الحقيقي للمستخدم الخارجي، مما يؤدي لإبطال وحظر كافة الروابط الشرعية تلقائياً.
   * **الحل الفني والترحيل السليم:** تفعيل تمرير الترويسة الحقيقية للعميل بداخل الـ Reverse Proxy (Nginx) أو تشغيل الحاوية بوضعية الشبكة المضيفة (\`network_mode: host\`).
2. **ثبات مفتاح التشفير السري بداخل الحاوية:** لتفادي تغير قيمة مفتاح التشفير السرية عند إعادة بناء الحاوية وإبطال الروابط الفعالة للمشتركين، يجب تثبيت قيمة \`STREAM_SECURITY_SECRET\` بالمتغيرات البيئية للحاوية.`
      },
      {
        id: 'api_stream_token_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء ميزة حماية روابط البث فعالة للأبد',
        content: `لحماية الباندويث المخصص لخوادم البث ومكافحة السرقة وإعادة البث غير القانوني للأبد دون قيود تجريبية، نقوم بحقن صمامات التخطي الدائمة في إعدادات الحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يبقي ميزة التشفير ومطابقة التواقيع نشطة وفعالة لحماية شبكة دفق الفيديو للأبد بشكل مجاني ومفتوح.`
      }
    ]
  },
  {
    id: 'api_stream_ar',
    title: 'تحليل محرك معالجة البث الرئيسي وتشغيل FFmpeg (Stream API)',
    lang: 'ar',
    description: 'تشريح مستقل وعميق لمجلد محرك معالجة البث وقنوات الترانسكودينج، وحلول استهلاك المعالج وتفعيل التسريع العتادي بكيوناب.',
    sections: [
      {
        id: 'api_stream_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج البث الرئيسي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/stream\`** القلب النابض والمسؤول البرمجي الأول عن **تحويل، وتشغيل، والتحكم بعمليات تدفق القنوات (FFmpeg Core Transcoding & Stream Process Spawner Controller)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/stream\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي للإنتاج المسؤول عن تشغيل وإيقاف قنوات IPTV والتحكم في إطلاق محركات FFmpeg كعمليات خلفية فرعية (Child Processes).
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات التحكم بالعمليات وإدارة الفيديو مادية.`
      },
      {
        id: 'api_stream_challenges',
        title: '٢. معوقات التحويل ودفق الفيديو في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تبرز تحديات بالغة الحساسية حول الأداء:
1. **استهلاك المعالج الفائق وغياب التسريع العتادي:** استخدام المعالج الرئيسي لكيوناب لتحويل الفيديو يرفع معدل استهلاك المعالج لـ 100% ويسبب تقطع البث.
   * **الحل الفني والترحيل السليم:** تفعيل وتمرير كرت الشاشة للحاوية (Intel QuickSync / Nvidia NVENC) بداخل إعدادات Docker Compose لتمكين FFmpeg من التحويل بواسطة كرت الشاشة المسرّع بدلاً من المعالج.
2. **عزل الحاوية ومجلد البث التلفزيوني:** لضمان ثبات الملفات المتولدة لقنوات IPTV، ينصح بربط مجلد الـ HLS بمسار فيزيائي دائم ومحفوظ على كيوناب.`
      },
      {
        id: 'api_stream_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء معالج البث نشطاً ومجاناً للأبد',
        content: `لكسر حظر النسخ التجريبية وضمان بقاء محرك تشغيل وبدء قنوات IPTV وتحويل كوديكس الفيديو والصوت معافى وسليماً دون قيود زمنية، نقوم بصياغة المتغيرات البيئية لـ Docker container لفرض التجاوز:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا الإجراء يضمن استمرارية بث الفيديو وتحويل الجودات بسلاسة وفوق أي سقف زمني أو تجاري وبلا انقطاع.`
      }
    ]
  },
  {
    id: 'api_system_ffmpeg_ar',
    title: 'تحليل فحص وإدارة بيئة الـ FFmpeg المترجم (FFmpeg API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد فحص وإعدادات محرك FFmpeg ومساراته بداخل الحاوية لـ QNAP والتحقق من الكوديكس والتسريع العتادي.',
    sections: [
      {
        id: 'api_system_ffmpeg_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج فحص بيئة FFmpeg المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/system/ffmpeg\`** النواة الخلفية المسؤولة عن **استعلام جودة وتفاصيل محرك FFmpeg (FFmpeg Binary Verification & Capabilities API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط \`/api/system/ffmpeg\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمكلف بفحص عتاد وقدرات مسارات FFmpeg وقراءة إصدار الكوديك ومواصفاته الفنية بالنظام.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات واستدعاء عمليات النظام قراءة العتاد.`
      },
      {
        id: 'api_system_ffmpeg_challenges',
        title: '٢. معوقات الكشف عن FFmpeg في بيئات Docker وحلول ترحيل QNAP NAS',
        content: `عند ترحيل مباشر ستريم لتشغيلها في حاويات Docker على سيرفرات **QNAP NAS**، تبرز تحديات فنية:
1. **انحراف مسار تشغيل الـ FFmpeg:** إذا كان الخادم يعتمد على مسار محلي خارجي، فستفشل دالة الفحص بداخل الحاوية.
   * **الحل الفني والترحيل السليم:** تثبيت الـ FFmpeg كحزمة أساسية بداخل الحاوية ذاتها وتوريث مسار الحاوية الافتراضي الصارم لمتغير البيئة الخاص بالخادم.
2. **فقدان صلاحيات الوصول لكرت الشاشة لفك كود المسرع:** يجب تمرير الصلاحيات وجهاز كرت الشاشة (\`/dev/dri\`) من نظام QNAP الحقيقي بداخل ملف التكوين لـ Docker Compose.`
      },
      {
        id: 'api_system_ffmpeg_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء ميزات معالجة وفحص الكوديك فعالة للأبد',
        content: `لكسر قيود التراخيص وضمان استمرارية تشغيل ومراقبة قدرات محرك FFmpeg وفحص كفاءة الخادم للأبد وبلا قيود تجريبية زمنية، نقوم بتمرير التفعيل الفوري بقيم البيئة للحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحمي محرك البث ويحافظ على تشغيله بدون قيود زمنية وتجارية.`
      }
    ]
  },
  {
    id: 'api_system_mediamtx_ar',
    title: 'تحليل إدارة خادم البث الفوري MediaMTX المترجم (MediaMTX API)',
    lang: 'ar',
    description: 'تشريح مستقل ومعمق لمجلد إدارة خادم البث المدمج وتكامل بروتوكولات RTMP/RTSP/WebRTC، وحلول تضارب المنافذ بكيوناب.',
    sections: [
      {
        id: 'api_system_mediamtx_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج إدارة MediaMTX المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/system/mediamtx\`** الركيزة المخصصة لـ **تكامل وإدارة بوابات البث الخارجية والداخلية (MediaMTX Streaming Gateway REST Manager & Integration API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط \`/api/system/mediamtx\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمكلف بالتحكم وإدارة خادم البث الفوري وصمامات وبوابات البث وقراءة المتفرجين.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات واستدعاء واجهة برمجة تطبيقات MediaMTX مادية.`
      },
      {
        id: 'api_system_mediamtx_challenges',
        title: '٢. معوقات ربط MediaMTX في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم وخادم MediaMTX بداخل حاويات Docker على سيرفرات **QNAP NAS**، تبرز تحديات بالمنافذ:
1. **مشكلة تضارب المنافذ وتوجيه الشبكة الداخلي:** يستهلك خادم MediaMTX منافذ متعددة ومهمة، ولا يستطيع الخادم المضيف التحدث معه بالـ localhost العادي.
   * **الحل الفني والترحيل السليم:** دمج الحاويتين بداخل ملف \`docker-compose.yml\` موحد وربطهما بشبكة داخلية مشتركة، وتوجيه مباشر ستريم للتحدث مع خدمة MediaMTX باسم الخدمة في Docker.
2. **بروتوكول التفاعل الفوري لـ WebRTC خلف جدران الحماية:** يجب ضبط ملف إعدادات MediaMTX وتمرير نطاق منافذ الـ UDP بالكامل بكيوناب.`
      },
      {
        id: 'api_system_mediamtx_bypass',
        title: '٣. دليل كسر القيود وضمان استقرار بوابة MediaMTX للأبد',
        content: `لضمان بقاء ميزة ربط خادم MediaMTX لتوفير بث عالي الجودة ومنخفض التأخير نشطة للأبد وبلا قيود تجريبية زمنية، نمرر التجاوز بالمتغيرات البيئية لـ Docker container:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يلغي صمامات الإغلاق ويجعل بوابات البث ونقل تدفقات الفيديو تعمل بأقصى كفاءة استقرار.`
      }
    ]
  },
  {
    id: 'api_telemetry_ar',
    title: 'تحليل جمع قياسات التلكم والمراقبة العتادية اللحظية (Telemetry API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد جمع قياسات أداء الخادم من CPU ورام وذاكرة، وتحديات دقة القراءة بداخل حاويات كيوناب.',
    sections: [
      {
        id: 'api_telemetry_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج قياسات التلكم المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/telemetry\`** المركز الحساس لـ **جمع قياسات الأداء والتلكم والمراقبة العتادية اللحظية (Server Resource Telemetry & Performance Logger API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/telemetry\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الرئيسي والمسؤول عن تلقي، وتسجيل، وعرض بيانات استهلاك الخادم من معالج ورامات وشبكة وأخطاء.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات رصد العتاد والأدوات المتطورة لاستكشاف أداء نظام التشغيل.`
      },
      {
        id: 'api_telemetry_challenges',
        title: '٢. معوقات جمع قياسات التلكم في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تظهر تحديات تحتية في دقة القياس:
1. **انحراف إحصائيات المعالج والذاكرة داخل الحاويات:** تقرأ مكتبة \`os\` المدمجة إجمالي الذاكرة والمعالج للسيرفر ككل وليس الحصة المحددة للحاوية (Control Groups).
   * **الحل الفني والترحيل السليم:** قراءة قيم استهلاك الموارد المحددة للحاوية من ملفات تحكم النظام (\`/sys/fs/cgroup/\`) بداخل لينكس بدلاً من الاعتماد على مكتبة os العامة.
2. **تراكم عمليات قراءة العتاد والـ Disk I/O:** يفضل حصر تجميع القياسات ليكون دورياً كل ثوانٍ، وتفادي الكتابة الفيزيائية المستمرة للمستندات بالهارد ديسك.`
      },
      {
        id: 'api_telemetry_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء مراقبة التلكم وسلامة النظام للأبد',
        content: `لمنع توقف ميزة مراقبة العتاد والقياسات الحيوية لنظام مباشر ستريم نتيجة صمامات الرخص أو النسخ التجريبية، نمرر المتغيرات البيئية الفورية لقمع الفحص وتفعيل النسخة المفتوحة:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يوفر مراقبة آمنة ومستقرة للأجهزة بشكل مجاني ومفتوح.`
      }
    ]
  },
  {
    id: 'api_views_ar',
    title: 'تحليل مراقبة وتتبع إحصائيات مشاهدات القنوات (Views API)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد تتبع أرقام المتفرجين ونسب الزيارات، وحلول فقدان البيانات وحصار الملفات بكيوناب.',
    sections: [
      {
        id: 'api_views_intro',
        title: '١. البنية الهيكلية والوظيفية لمعالج تتبع المشاهدات المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/api/views\`** الركيزة المخصصة لـ **تتبع إحصائيات المشاهدة وتحليلات نمو متفرجي القنوات (Channel Viewership Counter & Analytics Tracker API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/api/views\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي للإنتاج المسؤول عن زيادة عدادات المشاهدين وحفظ التقرير التراكمي وجلب أعلى القنوات مشاهدة.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات معالجة وتخزين البيانات وقراءة الكاش والزيارات مادية.`
      },
      {
        id: 'api_views_challenges',
        title: '٢. معوقات حفظ بيانات المشاهدات في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز معوقات متعلقة بالثبات والوصول:
1. **مشكلة ضياع الإحصائيات عند إعادة تشغيل الحاوية:** تُمسح كافة البيانات التراكمية التاريخية وسقوط عدادات القنوات للصفر عند زوال الحاوية المؤقتة.
   * **الحل الفني والترحيل السليم:** ربط مجلد حفظ الإحصائيات (\`/app/data\`) بمسار تخزين دائم وفيزيائي (Persistent Volume Mount) خارج الحاوية على خادم QNAP.
2. **بروتوكول القفل المتعدد للملفات (File Lock):** قد يسبب هجوم الزوار في وقت واحد توقف الاستجابة للملف وحجبه، لذا يفضل استخدام تجميع الذاكرة العشوائية السريعة أولاً.`
      },
      {
        id: 'api_views_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء عداد مشاهدات قنوات IPTV نشطاً للأبد',
        content: `لضمان بقاء ميزة تتبع أعداد المشاهدين والتقارير التحليلية للزوار نشطة ومفتوحة وبلا فترات تجريبية أو قيود حظر، نقوم بحقن صمامات التخطي الدائمة في إعدادات الحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا الإجراء يضمن استمرارية قراءة نسب الإقبال وتوفير التحليلات المفتوحة لإحصائيات المنصة للأبد.`
      }
    ]
  },
  {
    id: 'channel_ar',
    title: 'تحليل صفحات تفاصيل وتشغيل قنوات البث المترجم (Channel Route)',
    lang: 'ar',
    description: 'تشريح مستقل وعميق لمجلد وبنية صفحات تشغيل قنوات IPTV الديناميكية، وحلول تشغيل الكوديكس وعرض مشغل HLS بكيوناب.',
    sections: [
      {
        id: 'channel_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد صفحات القنوات المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/channel\`** الواجهة الهيكلية والمسؤول الفني الأول عن **تجميع وعرض صفحة تفاصيل وتشغيل قنوات IPTV (Channel Playback Layout & Dynamic Router Engine)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الديناميكي \`/channel/[id]\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`[id]/page.js\`**: كود الصفحة المترجم والمسؤول عن بناء الهيكل العام لصفحة تشغيل القناة وجلب تفاصيلها وربطها بالمشغل المتطور.
* **\`[id]/page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لتوريد المكونات المادية لمشغلات الميديا وخدمة الصور بسرعة.`
      },
      {
        id: 'channel_challenges',
        title: '٢. معوقات صفحات تشغيل القنوات في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز عقبات مظهرية وفنية مع المشغلات:
1. **انقطاع مشغل الفيديو بسبب قيود فك ترميز المتصفح:** قد تفشل الهواتف أو الشاشات في فك ترميز القنوات الأصلية بدقة HEVC (H.265)، مما يستدعي تحويل البث تلقائياً لترميز H.264 وصوت AAC عالي التوافق بداخل الخادم.
2. **مشكلة جلب المكونات المرئية للمشغل (Static Assets):** لتفادي بعثرة أزرار التحكم بالواجهات، ينصح بالاعتماد على حزم CDN خارجية لتسليم ملفات المظهر الخاصة بالمشغلات.`
      },
      {
        id: 'channel_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء صفحة تشغيل القنوات مفتوحة للأبد',
        content: `لمكافحة قيود انتهاء التراخيص ومنع تجميد واجهات تشغيل القنوات أمام المتفرجين، نمرر صمامات التجاوز في ملف التكوين البيئي للحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يلغي صمامات الإغلاق ويجعل صفحات تشغيل القنوات والمشغلات تعمل بسلاسة فائقة وبلا توقف للأبد.`
      }
    ]
  },
  {
    id: 'favicon_ar',
    title: 'تحليل الأيقونة الرمزية وهوية العلامة التجارية المترجمة (Favicon Route)',
    lang: 'ar',
    description: 'تشريح مستقل وفني لمعالج الأيقونة الرمزية للمنصة بالمتصفحات، وضمان ثبات الهوية البصرية بداخل حاوية كيوناب.',
    sections: [
      {
        id: 'favicon_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد favicon.ico المترجم',
        content: `يمثل الملف والمجلد **\`MubasherStream/app/.next/server/app/favicon.ico\`** الركيزة الفنية لـ **الأيقونة الرمزية وهوية العلامة التجارية لمتصفحات الويب (Brand Favicon Identity & Dynamic Asset Router)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار \`/favicon.ico\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي المترجم والمكلف بتغذية وتمرير ملف الأيقونة الرمزية بترميز ثنائي للمتصفحات وضبط ترويسات الكاش.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مسار الصورة المادية بذاكرة الخادم الفورية.`
      },
      {
        id: 'favicon_challenges',
        title: '٢. معوقات الأيقونة الرمزية والتحميل في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز بعض التحديات بالهوية البصرية:
1. **أخطاء الترويسة والصيغة خلف خوادم الـ Proxy:** قد يرفض متصفح الويب عرض الأيقونة إذا افتقرت لترويسة نوع البيانات الصارمة (\`Content-Type: image/x-icon\`).
2. **استبدال شعار وهوية المنصة المخصصة:** لضمان ثبات الأيقونات والشعارات المخصصة التي يضيفها المدير بعد إعادة بناء الحاوية، يجب ربط مجلد الملفات العامة (\`/app/public\`) بمسار دائم بالهارد ديسك خارج الحاوية.`
      },
      {
        id: 'favicon_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء هوية قنوات IPTV مفعلة للأبد',
        content: `لضمان بقاء هوية المنصة سليمة ومتاحة للأبد وبلا انقطاع أو حظر تراخيص، نقوم بتغذية الحاوية بالمتغيرات البيئية لكسر حظر القيود الزمنية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحافظ على التواجد الدائم للأيقونات وشعارات المنصة التجارية للأبد.`
      }
    ]
  },
  {
    id: 'api_imgs_slug_ar',
    title: 'تحليل معالج الصور والرموز الديناميكي المترجم (Imgs Slug Route)',
    lang: 'ar',
    description: 'تشريح مستقل وفني لمعالج الصور والرموز والشعارات لـ IPTV، وحلول تفادي تبخر الأصول وصلاحيات القراءة بكيوناب.',
    sections: [
      {
        id: 'api_imgs_slug_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد معالج الصور الديناميكي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/imgs/[...slug]\`** الركيزة الفنية لـ **معالجة وتوريد شعارات وصور القنوات الديناميكية (Dynamic Catch-All Images & Channel Icons Routing Gateway)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الديناميكي \`/imgs/[...slug]\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`route.js\`**: المعالج البرمجي الديناميكي المسؤول عن قراءة وتمرير تدفق بايتات الصور الثنائية وتعيين نوعها بدقة.
* **\`route.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مسارات تخزين الصور والملفات الثابتة بالنظام.`
      },
      {
        id: 'api_imgs_slug_challenges',
        title: '٢. معوقات معالجة وتخديم الصور في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تبرز تحديات متعلقة بثبات شعارات القنوات:
1. **مشكلة تبخر شعارات وصور القنوات المضافة:** تُمسح كافة الشعارات المرفوعة محلياً عند زوال الحاوية أو إعادة تشغيل السيرفر.
   * **الحل الفني والترحيل السليم:** ربط مسار حفظ الشعارات بالكامل (\`/app/public/assets/images\`) بمجلد تخزين دائم وفيزيائي خارج الحاوية على خادم QNAP.
2. **مشكلة صلاحيات القراءة والكتابة:** ضبط معطيات UID و GID بداخل الحاوية لتتطابق مع صلاحيات مستخدم كيوناب، لتجنب حدوث أخطاء Permission Denied.`
      },
      {
        id: 'api_imgs_slug_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء معالج الصور نشطاً للأبد',
        content: `لضمان استمرار خدمة الصور والشعارات للأبد وبلا انقطاع أو حظر تراخيص، نغذي الحاوية بالمتغيرات البيئية الفورية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يلغي صمامات الإغلاق ويجعل تصفح وجلب شعارات القنوات يعمل بأعلى استقرار.`
      }
    ]
  },
  {
    id: 'api_locked_ar',
    title: 'تحليل شاشة القفل وتعليق المنصة المترجم (Locked Route)',
    lang: 'ar',
    description: 'تشريح مستقل ومجهري لمجلد وبنية شاشة الحظر والحساب المعلق، وحلول تضارب التوجيه وحصار الملفات بكيوناب.',
    sections: [
      {
        id: 'api_locked_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد شاشة القفل المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/locked\`** الركيزة الفنية لـ **صفحة حظر الخدمة وشاشة الحساب المعلق أو المنتهي الصلاحية (Platform Lockout & Licence Suspension Screen Engine)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط المباشر \`/locked\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود الصفحة المترجم والمسؤول عن بناء وتصميم الهيكل العام والواجهة الرسومية لصفحة تعليق المنصة.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المكونات المرئية وحقول إدخال الرخص بصفحة الحظر.`
      },
      {
        id: 'api_locked_challenges',
        title: '٢. معوقات شاشة القفل والتعليق في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز تحديات فنية مع صمامات الحظر:
1. **مشكلة الحصار والتعليق اللانهائي:** قد تفشل عملية كتابة مفاتيح الترخيص الجديدة المرفوعة من الواجهة إذا كانت الحاوية تفتقر لصلاحيات الكتابة على الأقراص المضيفة.
   * **الحل الفني والترحيل السليم:** ربط مسار حفظ ملفات الرخصة وقاعدة البيانات بمسار تخزين فيزيائي متاح للكتابة خارج الحاوية على سيرفر كيوناب.
2. **مشكلة تضارب التوجيه وخداع المتصفحات:** لتفادي بقاء شاشة الحظر معروضة بالخطأ نتيجة كاش المتصفحات، نلغي التخزين المؤقت لصفحة القفل كلياً.`
      },
      {
        id: 'api_locked_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء المنصة مفتوحة للأبد دون شاشة الحظر',
        content: `لكسر قيود التراخيص تماماً وتجنب ظهور شاشة القفل والتعليق الحمراء أمام المستخدمين، نقوم بحقن صمامات التخطي الدائمة بالبيئة:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحمي الخادم ويضمن عدم تفعيل شاشة القفل وتحويل الزوار فوراً للواجهة الرئيسية المفتوحة للأبد.`
      }
    ]
  },
  {
    id: 'api_login_ar',
    title: 'تحليل صفحة تسجيل الدخول وإدارة الهوية المترجم (Login Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد صفحة تسجيل دخول المديرين وإصدار تذاكر الأمان، وحلول فقدان الجلسة وتمرير عناوين الزوار بكيوناب.',
    sections: [
      {
        id: 'api_login_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد بوابة تسجيل الدخول المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/login\`** البوابة الفنية والمسؤول الأول عن **صفحة وبوابة تسجيل دخول المستخدمين والمديرين (User Authentication Interface & Login Route Handler)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت الرابط المباشر \`/login\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة تسجيل الدخول المترجم والمسؤول عن رندر واجهة حقول إدخال اسم المستخدم وكلمة السر وتدقيق الصلاحية.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المكونات المرئية وحزم التوثيق والتشفير الآمن بذاكرة الخادم.`
      },
      {
        id: 'api_login_challenges',
        title: '٢. معوقات صفحة تسجيل الدخول في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS** تظهر تحديات بوابات الأمان والتوثيق:
1. **فقدان جلسة تسجيل الدخول بشكل متكرر عند إعادة التشغيل:** تفقد الحاوية بذور التشفير العشوائية بمجرد إعادة البناء مما يطرد المديرين النشطين.
   * **الحل الفني والترحيل السليم:** تعيين متغير بيئي ثابت وثابت يسمى \`JWT_SECRET\` بداخل ملف ".env" لتوحيد مفاتيح الأمان والتوثيق.
2. **مشكلة الحظر التلقائي للبروكسي بالخطأ:** لتجنب حظر عنوان الآي بي الداخلي لـ Docker Gateway، نمرر العناوين الحقيقية للزوار (\`X-Forwarded-For\`) خلف خوادم البروكسي.`
      },
      {
        id: 'api_login_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء بوابة الدخول نشطة للأبد',
        content: `لضمان بقاء ميزات الدخول والتحقق سليمة ومتاحة للأبد وبلا فترات تجريبية أو قيود تراخيص، نغذي ملف التكوين بقيم التخطي الفوري:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يزيل صمامات الإغلاق ويجعل لوحة الإدارة ومصادقة المستخدمين تعمل بأقصى كفاءة استقرار.`
      }
    ]
  },
  {
    id: 'api_mubasher_admin_about_ar',
    title: 'تحليل صفحة معلومات المنصة وإصدارات الخادم المترجم (Admin About Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد صفحة حول المنصة وتعريف الإصدارات والترخيص، ومشاكل قراءة العتاد الحقيقي بكيوناب.',
    sections: [
      {
        id: 'api_mubasher_admin_about_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد معلومات المنصة المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/mubasher_admin/about\`** الركيزة المخصصة لـ **صفحة تفاصيل وإصدار ومعلومات منصة البث (Admin System Information & About Platform UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الآمن \`/mubasher_admin/about\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة معلومات المنصة والنسخة المترجم والمسؤول عن رندر تفاصيل المطورين وحزم البرمجيات والخادم.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط المعالجات المرئية ومخططات حالة خادم مباشر ستريم.`
      },
      {
        id: 'api_mubasher_admin_about_challenges',
        title: '٢. معوقات صفحة معلومات المنصة في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز عقبات تقنية مع صفحة حول المنصة:
1. **انحراف مواصفات العتاد المعروضة بالواجهة:** يقرأ كود Node.js الافتراضي مواصفات الحاوية المعزولة وليس مواصفات سيرفر كيوناب الفيزيائي.
   * **الحل الفني والترحيل السليم:** توجيه مباشر ستريم لقراءة إحصائيات المعالج الحقيقي والرامات عبر استعلام مباشر لواجهة QNAP API الرسمية.
2. **بطء تحميل الصفحة بسبب فحص التحديثات التلقائي:** ينصح بإيقاف الاستعلام التلقائي الخارجي وتحديث الحاوية يدوياً لتفادي مشاكل الحجب الناري بكيوناب.`
      },
      {
        id: 'api_mubasher_admin_about_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء صفحة معلومات المنصة مفتوحة للأبد',
        content: `لمكافحة تجميد واجهات ومعلومات المنصة أمام المسؤولين وتأمين العرض المستمر لإصدار السيرفر المفتوح، نمرر المتغيرات البيئية لكسر حظر القيود الزمنية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا يحافظ على التواجد الدائم وإظهار الترخيص غير المحدود (Unlimited Perpetual) للأبد.`
      }
    ]
  },
  {
    id: 'api_mubasher_admin_backup_ar',
    title: 'تحليل صفحة النسخ الاحتياطي واستعادة البيانات المترجم (Admin Backup Route)',
    lang: 'ar',
    description: 'تشريح مستقل لمجلد إدارة تصدير واستيراد ملفات القنوات والتراخيص، وحلول محدودية الرفع وصلاحيات فك الضغط بكيوناب.',
    sections: [
      {
        id: 'api_mubasher_admin_backup_intro',
        title: '١. البنية الهيكلية والوظيفية لمجلد النسخ الاحتياطي المترجم',
        content: `يمثل المجلد **\`MubasherStream/app/.next/server/app/mubasher_admin/backup\`** الركيزة الفنية لـ **صفحة إدارة عمليات النسخ الاحتياطي واستعادة التكوينات وقنوات IPTV (Platform Configuration Backup & Database Restore UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الآمن \`/mubasher_admin/backup\`.

يحتوي هذا المجلد على الملفات المادية الفعلية الناتجة عن عملية البناء والترجمة:
* **\`page.js\`**: كود صفحة النسخ الاحتياطي واستيراد وتصدير قواعد البيانات المترجم والمسؤول عن ربط وظائف الحفظ والتنزيل.
* **\`page.js.nft.json\`**: ملف تتبع ملفات الخادم المعتمد لربط مكتبات ومحركات ضغط الأرشيف والـ Zip بالنظام.`
      },
      {
        id: 'api_mubasher_admin_backup_challenges',
        title: '٢. معوقات النسخ الاحتياطي واستعادة البيانات في بيئات Docker وسيرفرات QNAP NAS',
        content: `عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز تحديات مادية تعيق حماية البيانات:
1. **تبخر ملفات النسخ المتولدة وصعوبة رفع الملفات الضخمة:** قد تفشل عملية الاستيراد بسبب قيود حجم الرفع لـ Nginx Docker Bridge.
   * **الحل الفني والترحيل السليم:** حفظ النسخ الاحتياطية المتولدة بمجلد تخزين دائم على هارد ديسك QNAP، وضبط قيمة \`client_max_body_size\` لـ 100 ميجا بايت بكيوناب.
2. **مشكلة صلاحيات فك الضغط أثناء الاستعادة:** يفضل إيقاف قراءة ملف القنوات مؤقتاً بالخلفية لضمان الاستبدال الكامل والخالي من الأخطاء والتشوهات.`
      },
      {
        id: 'api_mubasher_admin_backup_bypass',
        title: '٣. دليل كسر القيود وضمان بقاء ميزات النسخ الاحتياطي نشطة للأبد',
        content: `لمنع حجب أدوات النسخ الاحتياطي واستعادة قنوات IPTV بسبب قيود الرخص والنسخ التجريبية، نقوم بحقن صمامات التخطي الدائمة في إعدادات الحاوية:
\`\`\`env
BYPASS_EXPIRE_CHECK=true
TRIAL_MODE=false
LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
\`\`\`
هذا التكوين يمنح المشرف صلاحيات أخذ النسخ الاحتياطية الآمنة واستعادتها بشكل مجاني ومفتوح للأبد.`
      }
    ]
  }
];


