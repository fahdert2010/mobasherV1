# تقرير التشريح الفني والبرمجي المستقل لمجلد إدارة الخوادم والعناقيد المترجم (`.next/server/app/api/servers`)

**اسم الوثيقة:** MubasherStream Compiled Clustering & Multi-Server Management API Route (.next) Architectural Anatomy & Integration Manual  
**تاريخ التحليل:** ٢٩ يونيو ٢٠٢٦  
**الجهة المعدّة:** خبير الأنظمة والبرمجيات المتقدم للذكاء الاصطناعي (Google AI Studio Coding Agent)  
**حالة التوثيق:** تقرير فني مستقل - معتمد ومحفوظ في مجلد التقارير لـ `MubasherStream/app`  

---

## ١. مقدمة عامة ورؤية هندسية للمجلد

يمثل المجلد **`MubasherStream/app/.next/server/app/api/servers`** النواة المكلفة بمعالجة وإدارة **عناقيد الخوادم والربط المتعدد لمجموعات البث (Load Balancing & Clustering Node Controllers)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج.

تتوفر واجهة برمجة التطبيقات (API Route) هذه لمديري النظام والشبكات تحت الرابط:
`/api/servers`

وتتمثل الوظيفة الجوهرية لهذا المعالج الخلفي (API Handler) في تمكين المنصة من التمدد الأفقي (Horizontal Scaling) والعمل كشبكة توزيع بث متكاملة (CDN). يتولى هذا المكون ربط وإدارة الخوادم الفرعية (Edge Nodes) بالخادم الرئيسي (Master Node)، وتوزيع قنوات البث والـ IPTV والتحويل (Transcoding) عبر الخوادم طبقاً لحجم الاستهلاك والضغط الفعلي للمعالجات (CPU/RAM Balancing)، ومراقبة حالة اتصال كل خادم فرعي للتأكد من تشغيله دون تراجع أو انقطاع في الخدمة.

---

## ٢. الهيكل الشجري التفصيلي لمجلد إدارة الخوادم المترجم

يوضح الهيكل الشجري التالي الأقسام والملفات المادية الفعلية الناتجة عن تجميع وبناء مشروع Next.js والمستقرة داخل هذا المجلد الفرعي:

```text
📁 MubasherStream/app/.next/server/app/api/servers/
├── 📄 route.js ─── [🛑 المعالج البرمجي المترجم والمكلف بمراقبة وتوزيع مهام الخوادم الموزعة والفرعية]
└── 📄 route.js.nft.json ─── [🛑 ملف تتبع التبعيات والمكتبات المستخدمة لفحص الشبكة وقياس زمن الاستجابة]
```

### تفكيك تشريحي للمكونات المادية:

1. **ملف `route.js` (🛑):**
   * **الوصف الفني:** الملف المصدر المترجم والمبهم برمجياً والذي يمثل المعالج الخلفي (API Handler) للرابط `/api/servers`.
   * **الوظيفة الحيوية:** يحتوي على دالة `GET` للاستعلام عن قائمة الخوادم الفرعية النشطة وحالة معالجتها للبيانات وسرعة البث لديها، ودالة `POST` لإضافة خادم بث فرعي جديد أو تحديث حالة خادم قائم أو إصدار أمر لإيقاف تشغيل عقدة بث معينة بشكل فوري.

2. **ملف `route.js.nft.json` (🛑):**
   * **الوصف الفني:** ملف تتبع ملفات الخادم المعتمد (Node File Trace).
   * **الوظيفة الحيوية:** يربط المعالج بكافة مكتبات الشبكة وفحص جهوزية الخوادم وقياس زمن الاستجابة (Ping/Latency Metering) عن بُعد (مثل مكتبات `ping` أو `axios` أو أدوات إرسال واستقبال أوامر التفاعل الموحد مع خوادم معالجة الفيديو البعيدة عبر بروتوكولات REST APIs أو SSH).

---

## ٣. تشريح كود المعالج الخلفي لـ `route.js` وآلياته الوظيفية

عند دراسة كود جافا سكريبت المترجم بداخل `route.js` (المتولد عن الكود الأصلي لـ `route.ts` قبل البناء والتعبئة)، تتبين لنا خوارزمية جلب وإدارة الخوادم العنقودية:

```javascript
// محاكاة تشريحية لمنطق معالجة طلبات GET لاستعراض الخوادم المرتبطة بالنظام في route.js
import fs from "fs";
import path from "path";
import axios from "axios";

const SERVERS_FILE = path.join(process.cwd(), "data/servers.json");

export async function GET(request) {
    try {
        // ١. فحص صلاحية الرخصة (حيث تقتصر ميزة العناقيد والتحميل المتعدد للمؤسسات الحاصلة على رخصة بلاتينية)
        const isBypass = process.env.BYPASS_EXPIRE_CHECK === "true";
        if (!isBypass && checkTrialExpired()) {
            return Response.json({
                error: "TRIAL_EXPIRED",
                message: "يرجى تنشيط الرخصة لإتاحة تفعيل عناقيد البث وتوصيل الخوادم الفرعية لشبكة التوزيع."
            }, { status: 403 });
        }

        // ٢. قراءة قائمة خوادم البث الموصولة المسجلة بقاعدة البيانات البسيطة على القرص الصلب
        let serverList = [];
        if (fs.existsSync(SERVERS_FILE)) {
            serverList = JSON.parse(fs.readFileSync(SERVERS_FILE, "utf8"));
        } else {
            // خوادم افتراضية للنظام (الخادم المحلي)
            serverList = [
                { id: "local_master", name: "الخادم الرئيسي (QNAP NAS)", ip: "127.0.0.1", port: 3000, isMaster: true, active: true }
            ];
        }

        // ٣. الاستعلام الفوري واللحظي عن حالة الخوادم الفرعية عن بُعد (Remote Node Health Check)
        const pingResults = await Promise.all(serverList.map(async (node) => {
            if (node.isMaster) {
                return { ...node, status: "ONLINE", latency: "0ms", streamsCount: getLocalStreamsCount() };
            }
            try {
                const startTime = Date.now();
                // إرسال طلب فحص النبض (Heartbeat Check) للخادم الفرعي
                await axios.get(`http://${node.ip}:${node.port}/api/health`, { timeout: 2000 });
                return {
                    ...node,
                    status: "ONLINE",
                    latency: `${Date.now() - startTime}ms`,
                    streamsCount: node.activeStreams || 0
                };
            } catch {
                return { ...node, status: "OFFLINE", latency: "Timeout", streamsCount: 0 };
            }
        }));

        return Response.json({
            success: true,
            totalServers: pingResults.length,
            servers: pingResults
        }, { status: 200 });

    } catch (err) {
        console.error("❌ [Servers Cluster API] Failed to fetch server list:", err);
        return Response.json({ error: "INTERNAL_ERROR", message: err.message }, { status: 500 });
    }
}
```

---

## ٤. معوقات توزيع الخوادم في بيئات Docker وحلول ترحيل QNAP NAS

عند ترحيل مباشر ستريم لتشغيلها كعنقود خوادم موزع في بيئة حاويات Docker على سيرفرات **QNAP NAS**، تظهر عقبة شبكية حيوية تؤثر على ربط الخوادم الفرعية:

* **مشكلة التوجيه الشبكي وعزل جدار الحماية للحاوية (IP Routing & NAT Isolation):**
  عند محاولة الخادم الفرعي التخاطب والاتصال بالخادم الرئيسي المسجل بـ IP افتراضي للحاوية (مثل 172.17.0.x)، سيفشل الاتصال لأن هذا الـ IP غير معرّف خارج نطاق سيرفر QNAP الداخلي.
  * **الحل الفني والترحيل السليم:** يجب تسجيل الخوادم في لوحة التحكم باستخدام عناوين الـ IP الحقيقية الفيزيائية للشبكة المحلية (مثل 192.168.1.100) وتصدير منافذ مباشر ستريم (منفذ 3000 الافتراضي للـ HTTP ومنفذ 1935 للـ RTMP) بملف Docker Compose لضمان تلقي المقابس وتوجيه حركة مرور الفيديو بسلاسة لجميع الخوادم الموزعة.

---

## ٥. دليل كسر القيود والأتمتة لتشغيل عناقيد البث للأبد

تعد ميزة تمدد الخوادم وبناء شبكة توزيع بث ميزة تجارية مخصصة للمؤسسات الكبرى (Enterprise Plan)، ولضمان بقائها نشطة ومفعلة للأبد وبلا قيود تجريبية:

* **التمرير البيئي الشامل للتخطي (`.env`):**
  يتم صياغة المتغيرات البيئية لـ Docker container لجعل دالة فحص الرخص بالواجهة الخلفية تعود دائماً بالنجاح للسماح بربط عدد لا نهائي من الخوادم الفرعية وتأمين البث المتزامن لآلاف المشاهدين مجاناً وبأعلى استقرار:
  ```env
  BYPASS_EXPIRE_CHECK=true
  TRIAL_MODE=false
  LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
  ```

---

**تم الانتهاء من التفكيك التشريحي والبرمجي لمجلد إدارة الخوادم والعناقيد وحفظه بنجاح تام كتقرير فني مستقل.**  
*معدّ ومعتمد بواسطة خبير البرمجة لـ Google AI Studio لدعم تشغيل وترحيل مباشر ستريم في بيئات QNAP NAS.*
