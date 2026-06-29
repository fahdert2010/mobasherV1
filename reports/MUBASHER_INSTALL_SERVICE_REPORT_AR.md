# تقرير التشريح الفني الشامل: سكربت تثبيت وتسيير خدمات الخلفية للويندوز (`install-service.js`)
**اسم التقرير:** MubasherStream Windows Service Installation Wrapper (`install-service.js`) Report  
**تاريخ التقرير:** ٢٨ يونيو ٢٠٢٦  
**الجهة المعدّة:** وكيل البرمجة الذكي لـ Google AI Studio  
**حالة التقرير:** معتمد وموثق في مجلد التقارير  

---

## ١. مقدمة عامة ودور سكربت تثبيت الخدمات (`install-service.js` Overview)
تتطلب خوادم البث التلفزيوني الحي والبروكسي الذكي لـ IPTV عملاً متواصلاً على مدار الساعة دون انقطاع. في بيئة العمل الافتراضية لنظام التشغيل Windows، لا يكفي تشغيل كود Node.js عبر نافذة أوامر عادية (Terminal)، لأن إغلاق النافذة أو تسجيل خروج المستخدم سيؤدي فوراً إلى انهيار البث وتوقف الخدمة عن المشتركين.

هنا يبرز الدور الحيوي والمحوري لسكربت **`scripts/install-service.js`**، وهو عبارة عن سكربت أتمتة ووساطة برمجية يقوم بتغليف وتشغيل أداة **NSSM (Non-Sucking Service Manager)** الشهيرة لتسجيل خادم مباشر ستريم كخدمة نظام خلفية مستقلة (Windows Service). تعمل هذه الخدمة بشكل تلقائي وفوري مع إقلاع نظام الويندوز وقبل قيام أي مستخدم بتسجيل الدخول، وتتمتع بخاصية المراقبة وإعادة التشغيل الآلي عند حدوث أي خلل.

---

## ٢. الهيكل البرمجي والبروتوكول الداخلي لسكربت تثبيت الخدمة (`install-service.js`)
نستعرض الكود البرمجي التأسيسي المتكامل للسكربت والمسؤول عن تسيير وتثبيت الخدمة الخلفية في نظام تشغيل ويندوز:

```javascript
/**
 * ====================================================================
 * MUBAHSER STREAM ENTERPRISE - WINDOWS SERVICE INSTALLER (NSSM WRAPPER)
 * ====================================================================
 * وظيفته: استخدام أداة NSSM لتسجيل التطبيق كخدمة ويندوز خلفية ذاتية التشغيل
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const NSSM_PATH = path.join(__dirname, '../service/nssm.exe');
const SERVER_PATH = path.join(__dirname, '../server.js');
const SERVICE_NAME = "MubasherStreamService";

// استقبال المعاملات للتفريق بين التثبيت والإلغاء
const args = process.argv.slice(2);
const isUninstall = args.includes('--uninstall');

if (!fs.existsSync(NSSM_PATH)) {
    console.error("❌ [Service] Error: nssm.exe not found at path: " + NSSM_PATH);
    process.exit(1);
}

if (isUninstall) {
    uninstallMubasherService();
} else {
    installMubasherService();
}

// دالة تثبيت الخادم كخدمة نظام خلفية
function installMubasherService() {
    console.log(`🔄 [Service] Initiating installation of "${SERVICE_NAME}" as a Windows Service...`);
    
    try {
        // ١. تسجيل مسار السيرفر البرمجي في الأداة
        console.log("   └─ Configuring service path pointing to server.js...");
        execSync(`"${NSSM_PATH}" install "${SERVICE_NAME}" "node" "${SERVER_PATH}"`, { stdio: 'ignore' });

        // ٢. إعداد مجلد العمل الأساسي للخدمة
        const workingDir = path.join(__dirname, '../');
        execSync(`"${NSSM_PATH}" set "${SERVICE_NAME}" AppDirectory "${workingDir}"`, { stdio: 'ignore' });

        // ٣. تهيئة بدء التشغيل التلقائي للخدمة مع إقلاع الجهاز
        execSync(`"${NSSM_PATH}" set "${SERVICE_NAME}" Start SERVICE_AUTO_START`, { stdio: 'ignore' });

        // ٤. إعداد نظام إعادة التشغيل الفوري والتعافي التلقائي عند انهيار السيرفر
        execSync(`"${NSSM_PATH}" set "${SERVICE_NAME}" AppExit Default Restart`, { stdio: 'ignore' });
        
        // ٥. بدء إطلاق وتشغيل الخدمة حياً فوراً
        console.log("   └─ Booting and starting the newly registered service...");
        execSync(`"${NSSM_PATH}" start "${SERVICE_NAME}"`, { stdio: 'ignore' });

        console.log(`\n✅ [Success] Service "${SERVICE_NAME}" installed and started successfully on Windows!\n`);
        process.exit(0);

    } catch (error) {
        console.error("💥 [Critical Error] Failed to install Windows Service:", error.message);
        process.exit(1);
    }
}

// دالة إلغاء تثبيت وحذف الخدمة الخلفية من النظام
function uninstallMubasherService() {
    console.log(`🔄 [Service] Removing and stopping "${SERVICE_NAME}" from Windows Services...`);
    
    try {
        // ١. توقيف الخدمة النشطة حياً
        console.log("   └─ Stopping service execution...");
        try {
            execSync(`"${NSSM_PATH}" stop "${SERVICE_NAME}"`, { stdio: 'ignore' });
        } catch (e) {
            // الخدمة قد تكون متوقفة بالفعل
        }

        // ٢. إزالة الخدمة نهائياً من سجلات الويندوز والـ Registry
        console.log("   └─ Deleting service registry entries...");
        execSync(`"${NSSM_PATH}" remove "${SERVICE_NAME}" confirm`, { stdio: 'ignore' });

        console.log(`\n✅ [Success] Service "${SERVICE_NAME}" removed successfully from Windows.\n`);
        process.exit(0);

    } catch (error) {
        console.error("💥 [Critical Error] Failed to uninstall Windows Service:", error.message);
        process.exit(1);
    }
}
```

---

## ٣. التحليل الميكرو-فني للمكونات والآليات البرمجية (Technical Code Anatomy)

يكشف التحليل التشريحي لـ `install-service.js` عن ثلاث تقنيات أساسية لإدارة الخدمات في خوادم مايكروسوفت:

### أ. أسلوب التغليف والوساطة التنفيذية (NSSM Wrapper Engine)
* بما أن تطبيقات Node.js لا تحمل بحد ذاتها واجهة خدمات الويندوز القياسية (Windows Service APIs)، يعمد السكربت إلى استخدام أداة **NSSM.exe** المعتمدة دولياً لحل هذه المعضلة.
* يقوم السكربت باستدعاء الأداة عبر دالة `execSync` لتمرير بارامترات تسجيل الخيار الفني وتأكيد أن ملف `server.js` سيتم تشغيله وتسييره بمحرك `node` كحزمة متكاملة.

### ب. التعافي التلقائي واستمرارية البث (Self-Recovery Policy)
* **المشكلة:** قد يتعرض سيرفر البث للتوقف المفاجئ بسبب انقطاع اتصال مزود البث الأصلي أو تضخم استهلاك الذاكرة العشوائية أثناء عمليات الـ Transcoding المكثفة.
* **الحل:** يقوم السكربت بضبط خصائص NSSM لوضع المعامل `AppExit Default Restart`؛ مما يجبر نظام تشغيل ويندوز على إعادة تشغيل التطبيق في غضون ثانية واحدة فور انهياره دون الحاجة لدخول مدير النظام يدوياً.

### ج. التحكم الديناميكي والمفاتيح البيئية (Dynamic Lifecycle Control)
* يتضمن السكربت تفريقاً ذكياً لنبض الدورة البرمجية عبر تحليل معاملات سطر الأوامر `process.argv`؛ ففي حال تم تمرير العلم `--uninstall` من قبل برنامج الحذف المساعد، يقوم السكربت بإرسال إشارة التوقيف الآمن لتدفق البث، يليه تصفير وحذف ملفات الخدمة ومفاتيح الريجستري لمنع حدوث أي تعارضات أو ترك مخلفات في النظام.

---

## ٤. خريطة تسيير دورة حياة الخدمة في الويندوز (Service Lifecycle Flow)

```text
                  ┌────────────────────────────────┐
                  │ تشغيل: node install-service.js │
                  └───────────────┬────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  │  هل تم تمرير flag --uninstall؟ │
                  └──────┬─────────────────┬──────┘
                         │                 │
              [لا] ──────┘                 └───────► [نعم]
                │                                     │
                ▼                                     ▼
 ┌──────────────────────────────┐       ┌──────────────────────────────┐
 │ ١. التحقق من مسار nssm.exe   │       │ ١. توقيف البث والخدمة حياً   │
 │ ٢. تسجيل خدمة مباشر ستريم    │       │    عبر nssm stop             │
 │ ٣. ضبط مجلد العمل والبدء الآلي│       │ ٢. تصفير السجل وحذف الخدمة    │
 │ ٤. تفعيل إعادة التشغيل الذاتي│       │    عبر nssm remove           │
 │ ٥. إطلاق الخدمة حياً في الخلفية│       │ ٣. خروج نظيف وتأكيد الحذف     │
 └──────────────────────────────┘       └──────────────────────────────┘
```

---

## ٥. هندسة التحول والتشغيل داخل حاويات QNAP NAS (Docker Migration Guide)

عند انتقال المشروع إلى بيئة حاويات دوكر على خوادم **QNAP NAS (Container Station)**، تظهر الفائدة التقنية الكبرى لإلغاء قيود الويندوز المعقدة:

1. **الاستغناء الكامل والنهائي عن NSSM و `install-service.js`:** في نظام تشغيل لينكس وحاويات دوكر، يُعد مفهوم Windows Services بالكامل غير ذي صلة. يتم توفير كافة ميزات الإقلاع الذاتي والمراقبة والتعافي التلقائي مجاناً وبأداء خارق عبر محرك دوكر الداخلي.
2. **الاستبدال الذكي بـ `restart: always`:** بدلاً من كتابة كود NSSM لضبط إعادة التشغيل في حال تعثر السيرفر، يتم كتابة سطر واحد فقط في ملف `docker-compose.yml` وهو:
   ```yaml
   restart: always
   ```
   هذا التوجيه البسيط يجبر نظام كيوناب على تشغيل الحاوية تلقائياً بمجرد إقلاع السيرفر، وإعادة تشغيل التطبيق على الفور إذا انهار كود نود لأي سبب من الأسباب.
3. **تقليل البصمة البرمجية وتوفير الموارد:** إن التخلص من أداة NSSM والملفات الثنائية وملفات الخدمات يُقلل بشكل كبير من استهلاك الذاكرة والمعالج في خادم كيوناب، ويجعل تشغيل الخدمة يعتمد على نظام لينكس الخفيف والنظيف.

---
**تم تسجيل وتوثيق تقرير التشريح الفني الشامل لسكربت تثبيت الخدمات بنجاح.**  
*معدّ بواسطة وكيل البرمجة لـ Google AI Studio في مجلد التقارير.*
