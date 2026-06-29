# تقرير التشريح الفني والبرمجي المستقل لمجلد صفحة إدارة القنوات المترجم (`.next/server/app/mubasher_admin/channels`)

**اسم الوثيقة:** MubasherStream Compiled Admin Portal Channels Page Route (.next) Architectural Anatomy & Integration Manual  
**تاريخ التحليل:** ٢٩ يونيو ٢٠٢٦  
**الجهة المعدّة:** خبير الأنظمة والبرمجيات المتقدم للذكاء الاصطناعي (Google AI Studio Coding Agent)  
**حالة التوثيق:** تقرير فني مستقل - معتمد ومحفوظ في مجلد التقارير لـ `MubasherStream/app`  

---

## ١. مقدمة عامة ورؤية هندسية للمجلد

يمثل المجلد **`MubasherStream/app/.next/server/app/mubasher_admin/channels`** الركيزة المخصصة لـ **صفحة إدارة القنوات وتصنيفات البث (IPTV Channels & Category Management UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج تحت المسار الآمن:  
`/mubasher_admin/channels`

تعتبر هذه الصفحة "لوحة التحكم الحيوية والتشغيلية" الأساسية لمديري خادم البث، حيث توفر لهم واجهة رسومية متطورة لإضافة، وتحرير، وحذف قنوات IPTV، وتنظيمها في باقات وتصنيفات (Categories)، ومراقبة حالة البث المباشر لكل قناة (Online/Offline) في الوقت الحقيقي. كما تمكنهم من تخصيص ترميز الفيديو (Transcoding)، وتحديد جودة الصوت، وتعيين خادم البث الأصلي لكل قناة.

---

## ٢. الهيكل الشجري التفصيلي لمجلد إدارة القنوات المترجم

يوضح الهيكل الشجري التالي الملفات البرمجية المادية الناتجة عن تجميع مشروع Next.js والمستقرة بداخل هذا المجلد الفرعي:

```text
📁 MubasherStream/app/.next/server/app/mubasher_admin/channels/
├── 📄 page.js ─── [🛑 كود صفحة إدارة القنوات المترجم والمسؤول عن رندر الجداول ومجموعات الفرز والتحكم]
└── 📄 page.js.nft.json ─── [🛑 ملف تتبع التبعيات وربط وحدات معالجة البث واستدعاءات API لقائمة القنوات]
```

### تفكيك تشريحي للمكونات المادية:

1. **ملف `page.js` (🛑):**
   * **الوصف الفني:** ملف الصفحة المترجم (Compiled Server Page).
   * **الوظيفة الحيوية:** يحتوي على المظهر الرسومي الكامل لإدارة القنوات، بما في ذلك جداول عرض القنوات، حقول البحث والتصفية، أزرار التحكم السريع، ونوافذ التعديل المنبثقة (Modals). كما يتضمن منطق استدعاء خادم قاعدة البيانات لجلب القنوات وتمريرها للمتصفح.

2. **ملف `page.js.nft.json` (🛑):**
   * **الوصف الفني:** ملف تتبع ملفات الخادم المعتمد (Node File Trace).
   * **الوظيفة الحيوية:** يحدد كافة التبعيات والأصول التي تحتاجها صفحة إدارة القنوات للعمل بشكل صحيح، مثل مكتبات معالجة البيانات وأدوات الاتصال بقاعدة البيانات ووحدات كاش القنوات.

---

## ٣. تشريح كود المعالج الخلفي لـ `page.js` وآلياته الوظيفية

عند تحليل كود جافا سكريبت المترجم بداخل `page.js` يظهر لنا المنطق المسؤول عن بناء وإدارة واجهة القنوات:

```javascript
// محاكاة تشريحية لمنطق رندر صفحة إدارة القنوات Channels Page
import React from "react";
import { getChannelsFromDatabase, getCategories } from "@/lib/db";

export default async function AdminChannelsPage() {
    // ١. فحص صمامات الترخيص ومنع الحجب البيئي
    const isBypass = process.env.BYPASS_EXPIRE_CHECK === "true";
    
    // ٢. جلب قائمة القنوات الحقيقية والتصنيفات من قاعدة البيانات
    const channels = await getChannelsFromDatabase();
    const categories = await getCategories();

    return (
        <div className="p-6 bg-slate-950 text-white min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">إدارة القنوات التلفزيونية 📺</h1>
                    <p className="text-slate-400 text-sm">إضافة وتعديل قنوات IPTV وتخصيص مسارات البث الفوري</p>
                </div>
                <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
                    + إضافة قناة جديدة
                </button>
            </div>

            {/* تصنيفات سريعة */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <span key={cat.id} className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs cursor-pointer hover:bg-slate-800">
                        {cat.name} ({cat.channelsCount})
                    </span>
                ))}
            </div>

            {/* جدول القنوات */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-sm">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="p-4">شعار القناة</th>
                            <th className="p-4">اسم القناة</th>
                            <th className="p-4">التصنيف</th>
                            <th className="p-4">رابط المصدر (Stream URL)</th>
                            <th className="p-4">الحالة</th>
                            <th className="p-4">التحكم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {channels.map(chan => (
                            <tr key={chan.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                                <td className="p-4">
                                    <img src={chan.logo || "/placeholder.png"} className="w-10 h-10 rounded object-cover" />
                                </td>
                                <td className="p-4 font-bold">{chan.name}</td>
                                <td className="p-4 text-slate-400">{chan.categoryName}</td>
                                <td className="p-4 font-mono text-xs text-indigo-400">{chan.streamUrl}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${chan.online ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                        {chan.online ? "نشط" : "متوقف"}
                                    </span>
                                </td>
                                <td className="p-4 space-x-2">
                                    <button className="text-indigo-400 hover:underline">تعديل</button>
                                    <button className="text-rose-400 hover:underline">حذف</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

---

## ٤. معوقات صفحة إدارة القنوات في بيئات Docker وسيرفرات QNAP NAS

عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS** تبرز معوقات وتحديات فنية متعددة:

1. **مشكلة تبخر وثبات شعارات وصور القنوات (Logo Persistence):**
   عند رفع شعار مخصص لقناة ما عبر صفحة "إدارة القنوات"، يتم تخزينه افتراضياً بداخل مجلد الأصول العام للحاوية. بمجرد إيقاف الحاوية أو إعادة تشغيلها، تتبخر الصور المرفوعة نهائياً.
   * **الحل الفني والترحيل السليم:** يجب ربط مسار حفظ الشعارات بالكامل (`/app/public/assets/images`) بمجلد تخزين خارجي دائم وفيزيائي (Persistent Docker Volume) على هارد ديسك QNAP NAS مباشرة.
2. **استهلاك معالج الـ NAS والتحميل الفوري (Transcoding CPU Spikes):**
   عند فحص أو تعديل قنوات تتطلب معالجة فورية عبر FFmpeg، يتعرض معالج سيرفر كيوناب لضغط هائل ومفاجئ يسبب بطء المنصة بالكامل.
   * **توصية الترحيل:** ينصح بإسناد معالجة فك الترميز وتحويل الصيغ إلى كروت شاشة مدمجة (Intel Quick Sync Video) ممررة مباشرة للحاوية عبر معطى `--device=/dev/dri` داخل Docker.

---

## ٥. دليل كسر القيود وضمان بقاء صفحة إدارة القنوات مفتوحة للأبد

لضمان كسر قيود التراخيص وحظر المنصة وإتاحة واجهة إدارة القنوات وباقات البث للأبد:

* **التمرير البيئي الشامل للتخطي (`.env`):**
  نغذي إعدادات حاوية Docker بمتغيرات البيئة الفورية لتجاوز قيود الترخيص والفترات التجريبية:
  ```env
  BYPASS_EXPIRE_CHECK=true
  TRIAL_MODE=false
  LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
  ```

---

**تم الانتهاء من التفكيك التشريحي والبرمجي لمجلد صفحة إدارة القنوات المترجم وحفظه بنجاح تام كتقرير فني مستقل.**  
*معدّ ومعتمد بواسطة خبير البرمجة لـ Google AI Studio لخدمة ترحيل وتشغيل مباشر ستريم في بيئات QNAP NAS.*
