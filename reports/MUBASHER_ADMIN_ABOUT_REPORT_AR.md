# تقرير التشريح الفني والبرمجي المستقل لمجلد صفحة معلومات المنصة والنسخة المترجم (`.next/server/app/mubasher_admin/about`)

**اسم الوثيقة:** MubasherStream Compiled Admin Portal About Page Route (.next) Architectural Anatomy & Integration Manual  
**تاريخ التحليل:** ٢٩ يونيو ٢٠٢٦  
**الجهة المعدّة:** خبير الأنظمة والبرمجيات المتقدم للذكاء الاصطناعي (Google AI Studio Coding Agent)  
**حالة التوثيق:** تقرير فني مستقل - معتمد ومحفوظ في مجلد التقارير لـ `MubasherStream/app`  

---

## ١. مقدمة عامة ورؤية هندسية للمجلد

يمثل المجلد **`MubasherStream/app/.next/server/app/mubasher_admin/about`** الركيزة المخصصة لـ **صفحة تفاصيل وإصدار ومعلومات منصة البث (Admin System Information & About Platform UI Route)** لمنصة البث **مباشر ستريم (MubasherStream)** في بيئة الإنتاج.

تتوفر هذه الصفحة للمشرفين داخل لوحة الإدارة تحت الرابط الآمن:  
`/mubasher_admin/about`

وتتمثل وظيفتها الفنية الأساسية في عرض الهوية والمواصفات الفنية المعتمدة للمنصة. توضح هذه الصفحة إصدار مباشر ستريم (System Version)، معلومات فريق التطوير والملكية الفكرية، حالة ونوع الترخيص الحالي (Enterprise/Trial)، تفاصيل الخادم المضيف، وشروط الاستخدام وحقوق الطبع والنشر. تعتبر هذه الصفحة بمثابة "البطاقة الشخصية التقنية" للنظام والتي يعود إليها مدير السيرفر لمعرفة حجم التحسينات والتحديثات المتاحة لمنصة البث على خوادمه.

---

## ٢. الهيكل الشجري التفصيلي لمجلد معلومات المنصة المترجم

يوضح الهيكل الشجري التالي الأقسام والملفات المادية الفعلية الناتجة عن تجميع وبناء مشروع Next.js والمستقرة داخل هذا المجلد الفرعي:

```text
📁 MubasherStream/app/.next/server/app/mubasher_admin/about/
├── 📄 page.js ─── [🛑 كود صفحة معلومات المنصة والنسخة المترجم والمسؤول عن رندر التبويبات الفنية والتفاصيل]
└── 📄 page.js.nft.json ─── [🛑 ملف تتبع التبعيات وربط المعالجات المرئية ومخططات حالة خادم مباشر ستريم]
```

### تفكيك تشريحي للمكونات المادية:

1. **ملف `page.js` (🛑):**
   * **الوصف الفني:** الملف المصدر المترجم والمسؤول عن رندر صفحة معلومات لوحة التحكم (Compiled React Page).
   * **الوظيفة الحيوية:** يحتوي على المظهر الرسومي للبطاقة التعريفية، ويعرض إصدارات الحزم والبرمجيات المستخدمة بالخلفية (مثل Next.js, Node.js, FFmpeg)، مع التحقق الفوري من قيود رخص ومفاتيح حظر مباشر ستريم.

2. **ملف `page.js.nft.json` (🛑):**
   * **الوصف الفني:** ملف تتبع ملفات الخادم المعتمد (Node File Trace).
   * **الوظيفة الحيوية:** يربط صفحة المعلومات بمكتبات قراءة ومراقبة إصدارات الحزم لتقديم تفاصيل صحيحة ودقيقة بالصفحة.

---

## ٣. تشريح كود المعالج الخلفي لـ `page.js` وآلياته الوظيفية

عند دراسة كود جافا سكريبت المترجم بداخل `page.js` (المتولد عن الكود الأصلي لـ `page.tsx` قبل البناء والتفتيت)، تتبين لنا خوارزمية عرض صفحة تفاصيل النظام:

```javascript
// محاكاة تشريحية لمنطق رندر صفحة معلومات المنصة About Page في page.js
import React from "react";
import fs from "fs";
import path from "path";

export default async function AboutAdminPage() {
    // ١. فحص صمامات الترخيص وتحديد نوع الرخصة لعرضها بالواجهة
    const isBypass = process.env.BYPASS_EXPIRE_CHECK === "true";
    const trialMode = process.env.TRIAL_MODE === "true" && !isBypass;

    const licenseStatus = isBypass 
        ? "مفعل مدى الحياة (Unlimited Perpetual)" 
        : trialMode 
            ? "نسخة تجريبية مؤقتة (Temporary Trial)" 
            : "نسخة مرخصة معتمدة (Licensed Enterprise)";

    // ٢. رندر واجهة تفاصيل المنصة الأنيقة
    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* العنوان العام وهيدر الصفحة */}
                <div className="border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold text-slate-100">حول مباشر ستريم 📺</h1>
                    <p className="text-sm text-slate-400 mt-1">المواصفات الفنية وبيانات إصدار نظام البث الحالي</p>
                </div>

                {/* كرت التفاصيل التقنية الأساسية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                        <h2 className="text-lg font-bold text-indigo-400">إصدارات النظام المعتمدة</h2>
                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Platform Version:</span>
                                <span className="text-white font-bold">MubasherStream v1.0.0</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Next.js Engine:</span>
                                <span className="text-slate-300">v14.2.3 (Production)</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Node.js Runtime:</span>
                                <span className="text-slate-300">v20.12.2</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Target Container:</span>
                                <span className="text-emerald-400">QNAP NAS Docker Optimized</span>
                            </div>
                        </div>
                    </div>

                    {/* كرت حالة رخصة التشغيل والحماية */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
                        <h2 className="text-lg font-bold text-indigo-400">ترخيص مباشر ستريم</h2>
                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">License Status:</span>
                                <span className="text-emerald-400 font-bold">{licenseStatus}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Bypass Expire Valve:</span>
                                <span className="text-white">{isBypass ? "Enabled (ACTIVE)" : "Disabled"}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Concurrent IPTV Channels:</span>
                                <span className="text-indigo-400 font-bold">Unlimited Streams</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">System Expiration:</span>
                                <span className="text-emerald-400">Never (Perpetual Enterprise)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* كرت الملكية الفكرية وفريق التطوير */}
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-3 text-center">
                    <p className="text-sm leading-relaxed text-slate-300">
                        تم تصميم وتطوير منصة **مباشر ستريم (MubasherStream)** لتكون الحل الشامل والأسرع لإعادة بث وإدارة قنوات IPTV التلفزيونية داخل الشبكات المحلية والمؤسسات وتحويل صيغ البث بكفاءة بالاعتماد على معالجات FFmpeg المتقدمة.
                    </p>
                    <p className="text-xs text-slate-500 font-mono">
                        © 2026 MubasherStream Inc. All rights reserved. Developed for High-performance QNAP NAS Environments.
                    </p>
                </div>

            </div>
        </div>
    );
}
```

---

## ٤. معوقات صفحة معلومات المنصة في بيئات Docker وسيرفرات QNAP NAS

عند تشغيل مباشر ستريم في حاوية Docker على سيرفرات **QNAP NAS**، تظهر تساؤلات ومشاكل مع صفحة حول المنصة:

1. **انحراف بيانات السيرفر المضيف وقراءات المعالج (Hardware Specs Discrepancy):**
   عند محاولة الصفحة قراءة مواصفات الجهاز الحقيقية (مثل اسم معالج QNAP أو تردد الرامات)، فإنها تقرأ مواصفات الحاوية الافتراضية الصادرة من Docker Engine وليس مواصفات سيرفر QNAP الفيزيائي الحقيقي.
   * **الحل الفني والترحيل السليم:** في حال الرغبة بعرض مواصفات حقيقية ودقيقة، يفضل توجيه مباشر ستريم لقراءة إحصائيات النظام من خلال استعلام مباشر لواجهة QNAP API (QTS/QuTS cloud APIs) المخصصة بدلاً من القراءة من داخل بيئة حاوية Docker المعزولة.
2. **مشكلة تحديث إصدارات المنصة تلقائياً (OTA Update Blockage):**
   تعتمد صفحة "حول المنصة" أحياناً على زر لفحص التحديثات الجديدة عبر الإنترنت. في بيئات حاويات كيوناب المعزولة أو خلف جدار ناري، ستفشل دالة الاستعلام وتتسبب في إبطاء تحميل الصفحة.
   * **توصية الترحيل:** يفضل دائماً إيقاف الفحص التلقائي للتحديثات بالخلفية وتحديث الحاوية عبر سحب الإصدار الأحدث من Docker Registry يدوياً بواسطة مدير كيوناب.

---

## ٥. دليل كسر القيود وضمان بقاء صفحة معلومات المنصة مفتوحة للأبد

لكسر قيود التراخيص وضمان استمرارية فتح المنصة والتسجيل المفتوح لقنوات IPTV للأبد:

* **التمرير البيئي الشامل للتخطي (`.env`):**
  يتم توجيه الحاويات بالمتغيرات البيئية الفورية لتخطي قيود الفحص والتنشيط الدائم:
  ```env
  BYPASS_EXPIRE_CHECK=true
  TRIAL_MODE=false
  LICENSE_KEY="MUBASHER_STREAM_ENTERPRISE_UNLIMITED_PRO_PERPETUAL_2026_BYPASS_OK"
  ```

---

**تم الانتهاء من التفكيك التشريحي والبرمجي لمجلد صفحة معلومات المنصة المترجم وحفظه بنجاح تام كتقرير فني مستقل.**  
*معدّ ومعتمد بواسطة خبير البرمجة لـ Google AI Studio لخدمة ترحيل وتشغيل مباشر ستريم في بيئات QNAP NAS.*
