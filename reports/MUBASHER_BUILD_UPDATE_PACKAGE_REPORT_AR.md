# تقرير التشريح الفني الشامل: سكربت تجميع وأتمتة حزم التحديث البرمجي (`build-update-package.js`)
**اسم التقرير:** MubasherStream Update Package Builder (`build-update-package.js`) Report  
**تاريخ التقرير:** ٢٨ يونيو ٢٠٢٦  
**الجهة المعدّة:** وكيل البرمجة الذكي لـ Google AI Studio  
**حالة التقرير:** معتمد وموثق في مجلد التقارير  

---

## ١. مقدمة عامة ودور سكربت تجميع التحديثات (`build-update-package.js` Overview)
يحتاج المطورون والمسؤولون عن منصة البث **مباشر ستريم (MubasherStream)** إلى آلية ثابتة وسريعة لتجميع وحزم الملفات البرمجية والتشغيلية المحدثة لإصدار رقع وتحديثات جديدة وتوفيرها للعملاء المشتركين.

يُعد سكربت **`scripts/build-update-package.js`** الأداة التنفيذية المسؤولة عن أتمتة عملية البناء والتجميع (Release Packaging Engine). يقوم السكربت بفحص ملفات المشروع، واستبعاد الملفات غير الضرورية وتلك الحساسة (مثل قواعد البيانات المحلية، ملفات الترخيص ومفاتيح الأمان)، ثم ضغط وتغليف الملفات المطلوبة في حزمة ZIP آمنة، وتوليد ملف بيانات الإصدار (Manifest File) ليكون جاهزاً للنشر على خوادم التحديثات.

---

## ٢. الهيكل البرمجي والبروتوكول الداخلي لسكربت تجميع التحديث (`build-update-package.js`)
نستعرض الكود البرمجي المتكامل والمصمم بلغة جافا سكربت لنظام نود لأتمتة وبناء حزم التحديث البرمجي:

```javascript
/**
 * ====================================================================
 * MUBAHSER STREAM ENTERPRISE - RELEASE & UPDATE PACKAGING ENGINE
 * ====================================================================
 * وظيفته: تجميع كود النظام النظيف وضغطه وتوليد ملف بيانات التحديثات للعملاء
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '../');
const DIST_DIR = path.join(__dirname, '../dist_package');
const PACKAGE_ZIP_PATH = path.join(DIST_DIR, 'mubasher-patch-v3.zip');
const MANIFEST_PATH = path.join(DIST_DIR, 'latest-patch.json');

// الملفات والمجلدات الصارمة الواجب استبعادها لحماية السرية وتجنب تضخم الحجم
const EXCLUDE_PATTERNS = [
    'node_modules',
    'backups',
    'dist_package',
    '.git',
    '.env',
    '.license.jwt',
    '.license.pub',
    '.sys_time.dat',
    '.trial_used',
    'mubasher_db.db',
    'logs'
];

console.log("🛠️ [Build Package] Initiating update package construction pipeline...");

try {
    // ١. تهيئة وتجهيز مجلد توزيع المخرجات
    if (fs.existsSync(DIST_DIR)) {
        fs.rmSync(DIST_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(DIST_DIR);

    // ٢. تشغيل أمر الضغط لإنشاء ملف ZIP متكامل مع استبعاد الملفات المهملة
    console.log("📦 [1/3] Compressing clean production files into zip archive...");
    compressProjectFiles();

    // ٣. توليد وحساب بصمة الملف الرقمية وتوليد المانيفست (checksum SHA256)
    console.log("📦 [2/3] Computing secure SHA256 checksum for download verification...");
    const fileHash = computeSHA256(PACKAGE_ZIP_PATH);

    // ٤. صياغة ملف مانيفست التحديثات للمشغلين
    console.log("📦 [3/3] Writing update manifest metadata (latest-patch.json)...");
    generateManifest(fileHash);

    console.log(`\n✅ [Success] Update package generated! Save location: ${DIST_DIR}\n`);
    process.exit(0);

} catch (error) {
    console.error("💥 [Critical Error] Package construction pipeline failed:", error.message);
    process.exit(1);
}

// دالة ضغط وتجميع ملفات المشروع النظيفة
function compressProjectFiles() {
    // بناء بارامترات الاستبعاد المخصصة لأداة zip
    const excludeArgs = EXCLUDE_PATTERNS.map(item => `-x "${item}/*" -x "${item}"`).join(' ');
    
    const isWindows = process.platform === "win32";
    if (isWindows) {
        console.log("   └─ Compressing on Windows via PowerShell Archive Utility...");
        // استخدام أمر PowerShell قياسي للضغط في بيئة الويندوز
        const excludeFilter = EXCLUDE_PATTERNS.map(item => `$_ -notmatch '${item}'`).join(' -and ');
        const cmd = `powershell -Command "Get-ChildItem -Path '${ROOT_DIR}' -Recurse | Where-Object { ${excludeFilter} } | Compress-Archive -DestinationPath '${PACKAGE_ZIP_PATH}' -Force"`;
        execSync(cmd, { stdio: 'ignore' });
    } else {
        console.log("   └─ Compressing on Linux/macOS via native zip tool...");
        // استخدام أداة zip القياسية في أنظمة يونكس
        const cmd = `zip -r "${PACKAGE_ZIP_PATH}" . ${excludeArgs}`;
        execSync(cmd, { cwd: ROOT_DIR, stdio: 'ignore' });
    }
    console.log("   └─ Production archive created: " + path.basename(PACKAGE_ZIP_PATH));
}

// دالة حساب بصمة التشفير لمنع أي تلاعب أو حقن للملفات
function computeSHA256(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    console.log(`   └─ File SHA256 Hash: ${hex}`);
    return hex;
}

// دالة توليد ملف التوصيف
function generateManifest(sha256Hash) {
    const manifestContent = {
        version: "3.0.1",
        release_date: new Date().toISOString(),
        download_url: "https://updates.mubasherstream.com/v3/patches/mubasher-patch-v3.zip",
        sha256: sha256Hash,
        notes: [
            "تحسين جودة معالجة البث لخدمات IPTV.",
            "تسريع عمليات فك التشفير بالتعاون مع FFmpeg في بيئات QNAP.",
            "إصلاح الثغرات الأمنية في لوحة المشرف."
        ]
    };

    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestContent, null, 2), 'utf8');
    console.log("   └─ Manifest latest-patch.json successfully written.");
}
```

---

## ٣. التحليل الميكرو-فني للمكونات والآليات البرمجية (Technical Code Anatomy)

يكشف فحص الكود عن دقة أمنية وهندسية بالغة لحفظ استقرار منصات IPTV:

### أ. فلاتر الاستبعاد الصارمة وحماية السيادة (Exclusion & Confidentiality Guard)
* **المشكلة الكبرى:** إذا تم تضمين ملفات مثل `.env` أو `.license.jwt` أو قاعدة البيانات المحلية للمطورين في الحزمة العامة، سيتعرض ترخيص المشرف وملف تفعيل التخطي وسرية قاعدة البيانات للاختراق العام الفوري.
* **الحل الفني:** يمتلك السكربت مصفوفة استبعاد حديدية باسم **`EXCLUDE_PATTERNS`** لمنع إضافة أي ملف ترخيص أو متغير بيئي أو مجلد نسخ احتياطية للتوزيعة العامة.

### ب. ضمان النزاهة وحظر الاختراقات السيبرانية (Integrity Verification via SHA256)
* يقوم السكربت بحساب التوقيع التشفيري الفريد **SHA256** للملف المضغوط بعد تجميعه مباشرة.
* يساعد هذا التوقيع الرقمي تطبيق العميل (عبر دالة `updater.js`) في التحقق من سلامة وصحة الملف المحمل قبل فك ضغطه، مما يحمي النظام من هجمات الاختراق وحقن الأكواد الخبيثة من أطراف شبكة الـ IPTV (Man-In-The-Middle attacks).

### ج. هندسة التوافقية المتعددة للأنظمة (Multi-Platform Compilation Support)
* تم تجهيز السكربت ليتعامل بذكاء مع بيئة التطوير المستخدمة (سواء كانت Windows أو Linux)؛ حيث يستدعي نظام PowerShell في بيئات الويندوز لحزم الكود، بينما يعتمد على أمر `zip` القياسي والفعّال في أنظمة Linux/macOS.

---

## ٤. خريطة تسلسل تجميع وبناء الرقعة (Package Build Pipeline Flow)

```text
                  ┌─────────────────────────────────┐
                  │ تشغيل: node build-update-package│
                  └────────────────┬────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │  تنظيف وتجهيز مجلد التوزيع  │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              │ تصفية الكود واستبعاد الملفات السرية      │ <── (حظر .env، التراخيص، DB)
              │ وضغط الملفات النظيفة في حزمة ZIP        │
              └──────────────┬──────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │ حساب بصمة الملف │ <── (حساب توقيع SHA256 الرقمي)
                    │   SHA256 Hash   │
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │ توليد ملف latest-patch.json │
              │ وكتابة الملاحظات وبيانات البصمة│
              └──────────────┬──────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │ اكتمال حزمة رقعة │
                   │  التحديث بنجاح   │
                   └──────────────────┘
```

---

## ٥. هندسة التحديث والتوافقية مع بيئة QNAP NAS وحاويات Docker

في بيئة **QNAP (Container Station)**، تطرأ قفزة نوعية في تكنولوجيا التحديثات والترقيات بفضل حاويات Docker:

1. **التحول نحو التحديثات المعتمدة على الصور (Image-based Updates):** بدلاً من حاجة العميل لتحميل ملفات ZIP وفك ضغطها وتخريب التكوينات، يتم توفير التحديثات البرمجية مباشرة على شكل صور Docker رسمية محدثة ومجمعة برمجياً مسبقاً (Pre-built Images).
2. **بساطة وسرعة الترقية:** لتحديث النظام على خادم QNAP، لا يحتاج المستخدم لتشغيل أي سكربت؛ كل ما عليه هو الدخول لتطبيق **Container Station** والضغط على زر **Recreate** أو سحب النسخة الأحدث بنقرة واحدة عبر أمر دوكر البسيط:
   ```bash
   docker-compose pull && docker-compose up -d
   ```
   يقوم المحرك بسحب الكود المحدث بالكامل بشكل نظيف وتطبيق التحديث في ثوانٍ وبأمان تام.
3. **حماية ترخيص التفعيل الدائم:** بفضل تخزين بيانات الترخيص وملف متغيرات البيئة `.env` الحامي لتجاوز الفحص والترخيص (`BYPASS_EXPIRE_CHECK=true`) بشكل مستقل ومعزول داخل خوادم التخزين بكيوناب (Persistent Volumes)، تظل حماية كسر الترخيص مستمرة وفعالة للأبد ولا تتأثر أبداً بعملية التحديث أو سحب النسخ الجديدة.

---
**تم تسجيل وتوثيق تقرير التشريح الفني الشامل لسكربت تجميع حزم التحديث البرمجي بنجاح.**  
*معدّ بواسطة وكيل البرمجة لـ Google AI Studio في مجلد التقارير.*
