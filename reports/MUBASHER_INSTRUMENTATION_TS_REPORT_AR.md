# تقرير التشريح الفني الشامل: مستند تهيئة وتأصيل البنية التحتية للخادم (`instrumentation.ts`)
**اسم التقرير:** MubasherStream Server bootstrapping & Instrumentation Anatomy Report  
**تاريخ التقرير:** ٢٨ يونيو ٢٠٢٦  
**الجهة المعدّة:** وكيل البرمجة الذكي لـ Google AI Studio  
**حالة التقرير:** معتمد وموثق في مجلد التقارير  

---

## ١. مقدمة عامة ودور ملف التكوين الأساسي (Introduction & Next.js Bootstrapping)
في إطار عمل **Next.js** الحديث، وتحديداً مع استخدام بنية موجه الصفحات الجديد (App Router)، تم تقديم ملف مخصص لإدارة عمليات الإطلاق الأولي للمنصة يدعى **`instrumentation.ts`**. يقع هذا الملف في المجلد الرئيسي لبيئة العمل البرمجية، ويتمتع بخصائص استثنائية تجعله أول كود حقيقي يتم تنفيذه في السيرفر قبل البدء في تلبية أي طلبات من متصفحي الويب أو مشاهدي IPTV.

يعمل ملف التهيئة والتأصيل بمثابة "حفل تدشين" السيرفر، حيث يجمع خدمات قاعدة البيانات والكاش والحماية ويتحقق من سلامتها وصلاحياتها قبل تدوير العجلة التشغيلية لمباشر ستريم.

---

## ٢. الهيكل البرمجي المكتوب بلغة TypeScript للملف (`instrumentation.ts`)

يتضمن كود التهيئة البنية الهيكلية والمؤسساتية التالية لضمان ترقية قاعدة البيانات وتكامل خدمات التخزين المؤقت وحماية الرخص:

```typescript
/**
 * ====================================================================
 * MUBAHSER STREAM ENTERPRISE - SERVER INSTRUMENTATION & BOOTSTRAP
 * ====================================================================
 * يتم تشغيل دالة register() لمرة واحدة فقط عند إقلاع الخادم بالخلفية.
 */

export async function register() {
    // ١. التأكد من التشغيل على جانب السيرفر الحقيقي (Node.js Environment)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log("\n🚀 [Instrumentation] Bootstrapping MubasherStream Enterprise System...");

        try {
            // ٢. جلب وبث الاتصالات البرمجية والتحقق من الجاهزية (Lazy Imports)
            const { getDatabase } = await import('@/lib/db');
            const { getRedis } = await import('@/lib/redis');
            const { verifyLicenseOnStartup } = await import('@/lib/license-check');
            const { startActiveSessionJanitor } = await import('@/lib/session-janitor');

            console.log("📂 [1/4] Connecting to PostgreSQL database...");
            const db = await getDatabase();
            await db.execute('SELECT 1'); // اختبار نبض الاتصال
            console.log("✅ PostgreSQL Connection: Active and Healthy.");

            console.log("📂 [2/4] Initializing Redis Cache engine...");
            const redis = await getRedis();
            await redis.ping(); // اختبار نبض محرك الكاش
            console.log("✅ Redis Cache Engine: Online and Pinged successfully.");

            console.log("📂 [3/4] Running Security and License Audits...");
            // في حال تفعيل BYPASS_EXPIRE_CHECK في .env، سيتجاوز الفحص ويعود بموجب
            const isAuthorized = await verifyLicenseOnStartup();
            if (!isAuthorized) {
                console.error("❌ Critical: Unauthorized License! Shutting down server process.");
                process.exit(1);
            }
            console.log("✅ Cryptographic License: Authorized & Active (Enterprise-Grade).");

            console.log("📂 [4/4] Launching Background IPTV Session Cleaners...");
            // تشغيل عامل النظافة لتدمير الجلسات الميتة وتحديث سجلات البث دورياً
            await startActiveSessionJanitor();
            console.log("✅ Background Session Janitor: Active and Polling.");

            console.log("\n⭐️ [System Status] MubasherStream Enterprise Core Started Successfully on Host 0.0.0.0!\n");

        } catch (error: any) {
            console.error("💥 [Critical Error] Bootstrapping failed during instrumentation execution!", error.message);
            // إغلاق السيرفر لمنع تشغيل نظام منهار جزئياً
            process.exit(1);
        }
    }
}
```

---

## ٣. التشريح المجهري البرمجي للعمليات الأربع (Anatomy of Startup Checklists)

يكشف فحص الكود عن آليات تقنية غاية في الذكاء والدقة لتفادي الأخطاء الكلاسيكية لإقلاع التطبيقات:

### أ. حارس بيئة التشغيل (`process.env.NEXT_RUNTIME === 'nodejs'`)
يقوم إطار Next.js بتشغيل الكود في بيئات متعددة أثناء البناء (مثل Edge runtime و Serverless). يضمن هذا الشرط الهام تنفيذ عمليات الاتصال بقواعد البيانات وبدء الحارس الخفي **فقط** عندما يكون السيرفر بصدد الإقلاع الفعلي كبيئة نود جي إس كاملة الصلاحيات، مما يمنع حدوث أخطاء نقص الحزم أثناء تجميع البناء (Build Phase).

### ب. استخدام جلب الموديولات المتأخر (Lazy Dynamic Imports)
* يرفض السكربت استخدام جمل الاستيراد الكلاسيكية `import ... from` في أعلى الملف.
* **السبب التقني:** لأن جمل الاستيراد الثابتة ستحاول استيراد الملفات والاتصال بالسيرفرات أثناء محاولة بناء المشروع وتجميعه (Build Time)، مما يسبب انهيار التجميع لعدم وجود اتصالات نشطة بقواعد البيانات في مخدمات التطوير والتجميع.
* يؤدي استخدام **`await import(...)`** المضمنة داخل الدالة إلى تأجيل جلب وتفعيل الموديولات الفنية حتى لحظة تشغيل السيرفر الفعلي على خادم QNAP.

### ج. فحص الجاهزية الثنائي (Postgres & Redis Health Checks)
* لا يكتفي النظام بفتح قنوات الاتصال، بل ينفذ أمراً وهمياً خفيفاً بقاعدة البيانات (`SELECT 1`) ومحاكاة نغمة الاتصال بكاش ريديس (`redis.ping()`) لضمان صحة وجاهزية البنية التحتية بشكل فعلي قبل السماح لأول مشترك بطلب البث.

### د. حارس الجلسات والاتصالات الميتة (IPTV Session Janitor)
* يطلق الملف عملية خدمة الخلفية المتزامنة والمستمرة (Background Daemon Process) والتي تسمى "عامل نظافة الجلسات" (Session Janitor). وظيفته مسح ذاكرة الكاش كل دقيقة والتحقق من المشاهدين الذين أغلقوا التلفاز أو انقطع عنهم الاتصال لتدمير خيوط اتصالهم (Inactive Sockets) وتحرير موارد المعالج فوراً.

---

## ٤. خريطة تسلسل المهام من الصفر وحتى جاهزية الخادم لاستقبال البث (Sequence of Execution)

```text
       ┌───────────────────────────────────────┐
       │      بدء تشغيل حاوية مباشر ستريم      │
       └──────────────────┬────────────────────┘
                          │
                          ▼ (استدعاء ملف التهيئة)
       ┌───────────────────────────────────────┐
       │     Next.js Runtime Initializer       │
       └──────────────────┬────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼ NEXT_RUNTIME === 'nodejs'
 ┌──────────────────────────────────────────────────────────────────┐
 │  ١. الاتصال بقاعدة بيانات PostgreSQL واختبار صحة الاتصال (Select 1)│
 │  ٢. الاتصال بخادم كاش Redis وتوليد استجابة بنجاح (Ping-Pong Check) │
 │  ٣. تمرير ترخيص التوقيع والموافقة على مفتاح التشغيل عبر License.pub │
 │  ٤. إطلاق خيوط عمال النظافة بالخلفية لمراقبة حركات IPTV وعناوين الأجهزة│
 └────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼ (اكتمال البنية بنجاح)
       ┌───────────────────────────────────────┐
       │  الخادم جاهز تماماً لاستقبال طلبات البث  │
       │     MubasherStream Core Is Ready      │
       └───────────────────────────────────────┘
```

---

## ٥. التشخيصات الفنية والترحيل لحاويات QNAP (Docker & Linux Best Practices)

* **الصلاحية التشغيلية:** عند ترحيل مباشر ستريم إلى حاويات QNAP، يمثل ملف `instrumentation.ts` صمام الأمان؛ فإذا تعطل الاتصال بالـ Postgres لسبب ما (مثل بدء تشغيل حاوية الـ App قبل اكتمال إقلاع حاوية الـ Database)، سيقوم الكود بإيقاف السيرفر ومطالبة نظام Docker بإعادة محاولة التشغيل الذكي عبر وضعية: `restart: unless-stopped`.
* **تفادي حارس التراخيص:** تتواصل دالة `verifyLicenseOnStartup()` مع ملفات الأمان والمفاتيح العامة. إذا تم تفعيل كسر الحماية عبر متغيرات بيئة `.env` كما سلف بالتقارير السابقة، يتم تمرير التهيئة دون توقف، ليدخل السيرفر في وضع الأمان اللانهائي والخدمة المفتوحة للعملاء.

---
**تم تسجيل وتوثيق تقرير التشريح الفني الشامل لملف تهيئة وتأصيل البنية التحتية بنجاح.**  
*معدّ بواسطة وكيل البرمجة لـ Google AI Studio في مجلد التقارير.*
