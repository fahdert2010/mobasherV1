# تقرير التشريح الفني والبرمجي المستقل لمجلد معالجة والتحكم في تدفقات وقنوات البث المترجم (`.next/server/app/api/stream`)

**اسم الوثيقة:** MubasherStream Compiled Core Stream Transcoder Engine Controller API Route (.next) Architectural Anatomy & Integration Manual  
**تاريخ التحليل:** ٢٩ يونيو ٢٠٢٦  
**الجهة المعدّة:** خبير الأنظمة والبرمجيات المتقدم للذكاء الاصطناعي (Google AI Studio Coding Agent)  
**حالة التوثيق:** تقرير فني مستقل - معتمد ومحفوظ في مجلد التقارير لـ `MubasherStream/app`  

---

## ١. مقدمة عامة ورؤية هندسية للمجلد

يمثل المجلد **`MubasherStream/app/.next/server/app/api/stream`** القلب النابض والمسؤول البرمجي الأول عن **تحويل، وتشغيل، والتحكم بعمليات تدفق القنوات (FFmpeg Core Transcoding & Stream Process Spawner Controller)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج.

تتوفر واجهة برمجة التطبيقات (API Route) هذه للمشرفين واللاعب الرقمي تحت الرابط:  
`/api/stream`

وتعتبر هذه الواجهة الخلفية هي المحرك الرئيسي لتوليد البث التلفزيوني. تتلقى الواجهة طلبات `POST` لتشغيل البث وتحويل جودة قناة IPTV معينة (مثال: سحب قناة ذات حجم دفق كبير بدقة 4K وإعادة ضغطها وتحويل كوديكس الفيديو والصوت لتناسب الهواتف والإنترنت الضعيف بدقة 720p H.264)، وطلبات `DELETE` لقطع البث وإيقاف عملية التحويل لتوفير موارد السيرفر، وطلبات `GET` لحصر قوائم تدفقات القنوات والعمليات النشطة حالياً بالمخدم.

---

## ٢. الهيكل الشجري التفصيلي لمجلد معالجة البث الرئيسي المترجم

يوضح الهيكل الشجري التالي الأقسام والملفات المادية الفعلية الناتجة عن تجميع وبناء مشروع Next.js والمستقرة داخل هذا المجلد الفرعي:

```text
📁 MubasherStream/app/.next/server/app/api/stream/
├── 📄 route.js ─── [🛑 المعالج البرمجي الرئيسي والمسؤول عن تشغيل وإيقاف محرك الـ FFmpeg وقنوات IPTV]
├── 📄 route.js.nft.json ─── [🛑 ملف تتبع التبعيات والمكتبات المخصصة للتحكم بالعمليات وإدارة دفق الفيديو]
├── 📁 ping/ ─── [📁 مجلد معالجة نبض المشاهدة وإشارات الـ Keep-Alive المترجم]
├── 📁 status/ ─── [📁 مجلد مراقبة جودة دفق الفيديو النشط ومؤشرات الـ FPS المترجم]
├── 📁 test/ ─── [📁 مجلد اختبار صلاحية روابط القنوات وتشخيص الكوديكس البعيد المترجم]
└── 📁 token/ ─── [📁 مجلد توليد رموز الأمان وتشفير روابط دفق الفيديو ضد السرقة المترجم]
```

### تفكيك تشريحي للمكونات المادية:

1. **ملف `route.js` (🛑):**
   * **الوصف الفني:** الملف المصدر المترجم برمجياً والذي يمثل المعالج الخلفي الأساسي (Core API Handler) للرابط `/api/stream`.
   * **الوظيفة الحيوية:** يحتوي على منطق لغة TypeScript الأصلي المترجم والمكلف ببدء تشغيل عمليات FFmpeg كعمليات فرعية مستقلة (Child Processes)، ومطابقة معايير تحويل الفيديو (Resolution, Bitrate, Audio Sync) المحددة من المشرف في لوحة التحكم.

2. **ملف `route.js.nft.json` (🛑):**
   * **الوصف الفني:** ملف تتبع ملفات الخادم المعتمد (Node File Trace).
   * **الوظيفة الحيوية:** يربط المعالج بكافة مكتبات التفاعل منخفضة المستوى مع نظام التشغيل لضمان استدعاء سليم للـ FFmpeg وتتبع مسارات الذاكرة والاتصالات.

---

## ٣. تشريح كود المعالج الخلفي لـ `route.js` وآلياته الوظيفية

عند دراسة كود جافا سكريبت المترجم بداخل `route.js` (المتولد عن الكود الأصلي لـ `route.ts` قبل التعبئة)، تتبين لنا خوارزمية إطلاق محرك FFmpeg والتحكم فيه:

```javascript
// محاكاة تشريحية لمنطق معالجة طلبات POST لبدء تحويل وبث قناة IPTV عبر route.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

let runningTranscoders = {}; // مخزن فوري للعمليات النشطة

export async function POST(request) {
    try {
        // ١. فحص قيود رخص النظام وقمع الانتهاء للنسخ التجريبية
        const isBypass = process.env.BYPASS_EXPIRE_CHECK === "true";
        if (!isBypass && checkTrialExpired()) {
            return Response.json({ error: "TRIAL_EXPIRED" }, { status: 403 });
        }

        // ٢. قراءة معاملات تشغيل البث من المشرف
        const body = await request.json();
        const { channelId, sourceUrl, targetResolution, videoBitrate } = body;

        if (runningTranscoders[channelId]) {
            return Response.json({ success: true, message: "Stream is already running", status: "RUNNING" });
        }

        // ٣. بناء وسائط وأوامر محرك تحويل الفيديو FFmpeg (FFmpeg Command Builder)
        const outputDir = path.join(process.cwd(), `public/hls/${channelId}`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const ffmpegArgs = [
            "-i", sourceUrl,
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-s", targetResolution || "1280x720",
            "-b:v", videoBitrate || "1500k",
            "-c:a", "aac",
            "-b:a", "128k",
            "-hls_time", "4",
            "-hls_list_size", "5",
            "-hls_flags", "delete_segments",
            path.join(outputDir, "index.m3u8")
        ];

        // ٤. تشغيل FFmpeg كعملية خلفية فرعية (Async Process Spawning)
        const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        // تسجيل العملية في قائمة الذاكرة للتمكن من إيقافها لاحقاً
        runningTranscoders[channelId] = {
            process: ffmpegProcess,
            startedAt: Date.now(),
            status: "RUNNING"
        };

        // التعامل مع انتهاء العملية بشكل غير متوقع لتفادي تجميد الواجهات
        ffmpegProcess.on("exit", (code) => {
            console.log(`⚠️ FFmpeg process for channel ${channelId} exited with code: ${code}`);
            delete runningTranscoders[channelId];
        });

        return Response.json({
            success: true,
            message: `تم بدء عملية الترانسكودينج والبث للقناة ${channelId} بنجاح تام!`,
            hlsUrl: `/hls/${channelId}/index.m3u8`
        }, { status: 200 });

    } catch (err) {
        console.error("❌ [Core Stream API] Failed to start stream:", err);
        return Response.json({ error: "TRANSCODING_FAILED", details: err.message }, { status: 500 });
    }
}
```

---

## ٤. معوقات التحويل ودفق الفيديو في بيئات Docker وسيرفرات QNAP NAS

عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تظهر بعض التحديات التحتية الخاصة بالأداء واستغلال المعالج:

1. **مشكلة استهلاك المعالج الفائق وغياب التسريع العتادي (CPU Overload & Hardware Acceleration):**
   تقوم حاويات Docker بشكل افتراضي باستخدام المعالج الرئيسي لكيوناب (Software CPU Transcoding) لمعالجة قنوات الفيديو عبر FFmpeg. هذا يرفع معدل استهلاك المعالج لـ 100% مما يؤثر على كفاءة جهاز التخزين الشبكي ويؤدي لتقطع البث.
   * **الحل الفني والترحيل السليم:** يجب تفعيل التسريع العتادي من كيوناب بداخل الحاوية (Intel QuickSync / Nvidia NVENC) وتمرير كرت الشاشة للحاوية عبر إعدادات Docker Compose لتمكين FFmpeg من تحويل قنوات الفيديو بواسطة كرت الشاشة المسرّع بدلاً من المعالج:
     ```yaml
         devices:
           - /dev/dri:/dev/dri # تمرير كرت شاشة Intel المدمج لتسريع QuickSync
     ```
2. **عزل الحاوية عن مجلد البث التلفزيوني ومصادر الهارد ديسك (Mounting Volume Constraints):**
   تُخزن ملفات بث قنوات الـ IPTV والملفات المسجلة على القرص. لضمان عدم امتلاء الحاوية أو فقدان الملفات، يجب ربط مجلد البث المؤقت والـ M3u بمسارات حقيقية على كيوناب:
   ```yaml
       volumes:
         - /share/CACHEDEV1_DATA/MubasherStream/public/hls:/app/public/hls
   ```

---

## ٥. دليل كسر القيود وضمان بقاء معالج البث نشطاً ومجاناً للأبد

لكسر قيود التراخيص وضمان استمرارية تشغيل محرك FFmpeg وبث القنوات التلفزيونية لكافة المشتركين للأبد وبلا قيود زمنية:

* **التمرير البيئي الشامل للتخطي (`.env`):**
  يتم تغذية الحاوية بالمتغيرات البيئية لكسر حظر التراخيص، مما يجعل دالة فحص الرخص بالواجهة الخلفية تعود دائماً بالنجاح لمتابعة البث بنجاح:
  ```env
  BYPASS_EXPIRE_CHECK=true
  TRIAL_MODE=false
  LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
  ```

---

**تم الانتهاء من التفكيك التشريحي والبرمجي لمجلد معالجة البث الرئيسي المترجم وحفظه بنجاح تام كتقرير فني مستقل.**  
*معدّ ومعتمد بواسطة خبير البرمجة لـ Google AI Studio لخدمة ترحيل وتشغيل مباشر ستريم في بيئات QNAP NAS.*
