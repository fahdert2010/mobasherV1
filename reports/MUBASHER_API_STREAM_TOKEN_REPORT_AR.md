# تقرير التشريح الفني والبرمجي المستقل لمجلد توليد رموز حماية وتشفير مسارات البث المترجم (`.next/server/app/api/stream/token`)

**اسم الوثيقة:** MubasherStream Compiled Stream URL Tokenization & Anti-Leech Protection API Route (.next) Architectural Anatomy & Integration Manual  
**تاريخ التحليل:** ٢٩ يونيو ٢٠٢٦  
**الجهة المعدّة:** خبير الأنظمة والبرمجيات المتقدم للذكاء الاصطناعي (Google AI Studio Coding Agent)  
**حالة التوثيق:** تقرير فني مستقل - معتمد ومحفوظ في مجلد التقارير لـ `MubasherStream/app`  

---

## ١. مقدمة عامة ورؤية هندسية للمجلد

يمثل المجلد **`MubasherStream/app/.next/server/app/api/stream/token`** الدرع الأمني الحامي لمنصة البث والمسؤول عن **توليد وتأكيد رموز تشفير روابط البث ومكافحة السرقة (Secure Stream Tokenization & Anti-Leeching Protection API)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج.

تتوفر واجهة برمجة التطبيقات (API Route) هذه للاعبي الفيديو المعتمدين والمشاهدين تحت الرابط:  
`/api/stream/token`

وتكمن الأهمية الاستراتيجية المطلقة لهذا المعالج في حماية موارد وعائدات الشبكة. يقوم هذا المكون بتوليد روابط بث مشفرة تحتوي على رمز أمان مؤقت (Secure Tokenized Links) لكل مستخدم مسجل. يمنع هذا الرمز عمليات سرقة روابط القنوات وإعادة بثها خارج متصفح المنصة (Anti-Hotlinking / Anti-Leech)، فإذا حاول مستخدم نسخ رابط الـ M3U8 وتشغيله على قارئ خارجي مثل VLC دون الحصول على رمز صالح أو بتوقيت منتهٍ، سيقوم هذا المعالج برفض الطلب وقطع البث فوراً لحماية الباندويث المخصص للسيرفر.

---

## ٢. الهيكل الشجري التفصيلي لمجلد حماية روابط البث المترجم

يوضح الهيكل الشجري التالي الأقسام والملفات المادية الفعلية الناتجة عن تجميع وبناء مشروع Next.js والمستقرة داخل هذا المجلد الفرعي:

```text
📁 MubasherStream/app/.next/server/app/api/stream/token/
├── 📄 route.js ─── [🛑 المعالج البرمجي الرئيسي للإنتاج المسؤول عن توليد والتحقق من رموز البث المشفرة]
└── 📄 route.js.nft.json ─── [🛑 ملف تتبع التبعيات والمكتبات المستخدمة لحساب التواقيع الرقمية والتشفير الـ JWT]
```

### تفكيك تشريحي للمكونات المادية:

1. **ملف `route.js` (🛑):**
   * **الوصف الفني:** الملف المصدر المترجم والمدمج والذي يمثل المعالج الخلفي (API Handler) للرابط `/api/stream/token`.
   * **الوظيفة الحيوية:** يحتوي على دالة `POST` لاستقبال بيانات المشاهد وقناة البث وتوليد توقيع رقمي مشفر (HMAC-SHA256 أو JWT Token) برمز أمان تنتهي صلاحيته خلال فترة وجيزة، ودالة `GET` للتحقق من صلاحية التوكن قبل تفويض خادم البث دفق الملف للمتصفح.

2. **ملف `route.js.nft.json` (🛑):**
   * **الوصف الفني:** ملف تتبع ملفات الخادم المعتمد (Node File Trace).
   * **الوظيفة الحيوية:** يربط المعالج بكافة مكتبات معالجة البيانات وتشفير النصوص وحساب التواقيع الثنائية (مثل مكتبات `crypto` المدمجة بنود أو حزم التوقيع الآمن الـ `jsonwebtoken`).

---

## ٣. تشريح كود المعالج الخلفي لـ `route.js` وآلياته الوظيفية

عند دراسة كود جافا سكريبت المترجم بداخل `route.js` (المتولد عن الكود الأصلي لـ `route.ts` قبل البناء والتعبئة)، تتبين لنا خوارزمية توليد والتحقق من توكن البث:

```javascript
// محاكاة تشريحية لمنطق معالجة طلبات POST لتوليد رمز حماية بث مشفر لقناة IPTV في route.js
import crypto from "crypto";

const STREAM_SECRET_KEY = process.env.STREAM_SECURITY_SECRET || "MubasherStreamDefaultSecretKey2026";

export async function POST(request) {
    try {
        // ١. فحص صمامات الترخيص ومنع الحماية في الأنظمة غير المسجلة
        const isBypass = process.env.BYPASS_EXPIRE_CHECK === "true";
        if (!isBypass && checkTrialExpired()) {
            return Response.json({ error: "TRIAL_EXPIRED" }, { status: 403 });
        }

        // ٢. استخراج اسم القناة والـ IP الخاص بالمشاهد وفترة الصلاحية
        const body = await request.json();
        const { channelId, clientIp, durationSeconds } = body;

        if (!channelId || !clientIp) {
            return Response.json({ error: "BAD_REQUEST", message: "channelId and clientIp are required" }, { status: 400 });
        }

        // ٣. توليد رمز تشفير مؤقت مرتبط بعنوان الـ IP ومقفل بفترة صلاحية زمنية (Dynamic IP-Locked Token)
        const expiresAt = Math.floor(Date.now() / 1000) + (durationSeconds || 3600); // صلاحية ساعة افتراضياً
        
        const payload = `${channelId}|${clientIp}|${expiresAt}`;
        const signature = crypto
            .createHmac("sha256", STREAM_SECRET_KEY)
            .update(payload)
            .digest("hex");

        const secureToken = `${signature}.${expiresAt}`;

        return Response.json({
            success: true,
            token: secureToken,
            expires: expiresAt,
            urlParam: `?token=${secureToken}`,
            antiLeechActive: true
        }, { status: 200 });

    } catch (err) {
        console.error("❌ [Token Generator API] Secure tokenization failed:", err);
        return Response.json({ error: "INTERNAL_ERROR", details: err.message }, { status: 500 });
    }
}
```

---

## ٤. معوقات نظام حماية روابط البث في بيئات Docker وسيرفرات QNAP NAS

عند تشغيل مباشر ستريم في حاويات Docker على سيرفرات **QNAP NAS**، تظهر بعض التحديات التحتية الخاصة بتطابق عناوين الـ IP الخاصة بالمشاهدين:

1. **مشكلة تطابق الـ IP خلف عتبة الـ NAT (Docker Bridge IP Mis-match):**
   عند توليد توكن تشفير روابط البث ليكون مقفلاً على IP العميل (IP-Locked Token) لضمان عدم مشاركته، قد يرى خادم مباشر ستريم داخل الحاوية عنوان الـ IP الداخلي لـ Docker Bridge (مثل 172.17.0.1) بدلاً من الـ IP الحقيقي للمستخدم الخارجي. هذا الاختلاف يؤدي لرفض التوكن تلقائياً وانقطاع البث عن كافة المشاهدين الشرعيين.
   * **الحل الفني والترحيل السليم:** يجب التأكد من تمرير عنوان الـ IP الحقيقي من بوابة الويب للواجهة الخلفية عبر تفعيل خاصية تمرير الترويسة (`X-Forwarded-For` أو `X-Real-IP`) بداخل الـ Proxy، أو تشغيل الحاوية بوضعية الشبكة المضيفة (`network_mode: host`) لإظهار العناوين الحقيقية للشبكة المنزلية أو المكتبية مباشرة بدون عوائق.
2. **ثبات مفتاح التشفير السري (Security Secret Persistence):**
   إذا تم توليد قيمة المفتاح السري `STREAM_SECURITY_SECRET` عشوائياً عند تشغيل الخادم ولم يتم تثبيتها بمتغيرات البيئة، فبمجرد إعادة تشغيل الحاوية أو تحديثها ستتغير القيمة السرية، مما يؤدي لإبطال كافة روابط البث والتوكنز الفعالة وتوقف التلفزيونات الذكية للمشتركين بشكل مفاجئ.
   * **توصية هجرة البيانات الفنية:** يجب تحديد قيمة ثابتة وموحدة للمفتاح الأمني السري بملف التكوين البيئي للحاوية لمنع تغيرها:
     `STREAM_SECURITY_SECRET="MySuperPermanentSecuritySecret2026Key"`

---

## ٥. دليل كسر القيود وضمان بقاء ميزة حماية روابط البث فعالة للأبد

لكسر قيود التراخيص وضمان استمرارية توليد رموز الحماية ومقاومة السرقة وحماية باندويث الخادم للأبد:

* **التمرير البيئي الشامل للتخطي (`.env`):**
  يتم تغذية حاويات كيوناب بالمتغيرات البيئية لكسر حظر التراخيص، مما يجعل دالة فحص الرخص بالواجهة الخلفية تعود دائماً بالنجاح لمتابعة التشفير بنجاح:
  ```env
  BYPASS_EXPIRE_CHECK=true
  TRIAL_MODE=false
  LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
  ```

---

**تم الانتهاء من التفكيك التشريحي والبرمجي لمجلد حماية روابط البث المترجم وحفظه بنجاح تام كتقرير فني مستقل.**  
*معدّ ومعتمد بواسطة خبير البرمجة لـ Google AI Studio لدعم تشغيل وترحيل مباشر ستريم في بيئات QNAP NAS.*
