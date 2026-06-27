# Legacy Core — نظام ERP محاسبي

نظام محاسبة متكامل مبني بـ Vanilla JS + Supabase + GitHub Pages.

---

## 🏗️ هيكل الملفات

### الملفات الأساسية
| الملف | الوظيفة |
|-------|---------|
| `index.html` | هيكل التطبيق الكامل وكل الشاشات |
| `style.css` | التصميم — Dark Mode + RTL + Mobile |
| `sw.js` | Service Worker — PWA + Offline (v: lft-v151) |
| `manifest.json` | إعدادات PWA |
| `report.html` | تقرير خارجي للعملاء |

### وحدات JavaScript

#### ⚙️ الأساسيات
| الملف | الوظيفة |
|-------|---------|
| `js/config.js` | Supabase config + متغيرات عامة + helpers مشتركة + Realtime |
| `js/auth.js` | تسجيل الدخول والخروج |
| `js/ui_helpers.js` | مساعدات الواجهة — navigation + sidebar + breadcrumb |

#### 📁 المشاريع (مقسّم من projects.js)
| الملف | الوظيفة |
|-------|---------|
| `js/projects-data.js` | تحميل المشاريع والقيود من Supabase |
| `js/projects-entry.js` | إدخال وتعديل وحذف القيود |
| `js/projects-manage.js` | إنشاء وتعديل وحذف المشاريع |
| `js/projects-filter.js` | فلتر القيود + import Excel |
| `js/projects-render.js` | عرض المشروع والقيود |

#### 📊 التقارير (مقسّم من reports.js)
| الملف | الوظيفة |
|-------|---------|
| `js/reports-core.js` | الأساسيات — فتح التقارير + CashFlow + Summary + Filter |
| `js/reports-contractor.js` | تقارير المقاولين |
| `js/reports-client.js` | تقارير العميل + المستحقات |
| `js/reports-mq.js` | قيود المقاولين + Pagination + Import Excel |

#### 🎨 واجهة المستخدم (مقسّم من ui_comps.js)
| الملف | الوظيفة |
|-------|---------|
| `js/ui-login.js` | شاشة الدخول + particles + dark mode |
| `js/ui-modals.js` | النوافذ المنبثقة — كلمة المرور + ربط المستخدم |
| `js/ui-dash-filter.js` | فلتر الداشبورد + date helpers |
| `js/ui-pdf.js` | PDF helpers + Excel helpers |
| `js/ui-print.js` | طباعة + تقارير PDF |

#### 📦 وحدات أخرى
| الملف | الوظيفة |
|-------|---------|
| `js/dashboard.js` | لوحة التحكم والإحصائيات |
| `js/advances.js` | العهد والسلف |
| `js/dues.js` | مستحقات المقاولين |
| `js/admin.js` | إدارة المستخدمين والفترات |
| `js/notifs.js` | الإشعارات + Approval workflow |
| `js/owner.js` | واجهة المالك |
| `js/search.js` | البحث الشامل |
| `js/notes.js` | الملاحظات |
| `js/archive.js` | الأرشيف |
| `js/whatsapp.js` | واتساب |
| `js/backup.js` | النسخ الاحتياطي |

---

## 👥 الأدوار والصلاحيات

| الدور | الصلاحيات |
|-------|-----------|
| `owner` | كل الصلاحيات + إعدادات النظام |
| `admin` | إدارة + موافقة على القيود والعهد |
| `accountant` | إدخال قيود + تقارير |
| `viewer` | مشاهدة العهد فقط |

---

## ✨ الميزات الرئيسية

- ✅ **Realtime** — أي تغيير يظهر فوراً لكل المستخدمين
- ✅ **Approval Workflow** — قيود وعهد تحتاج موافقة أدمن
- ✅ **Audit Log** — سجل كامل لكل العمليات
- ✅ **PWA + Offline** — يشتغل بدون إنترنت
- ✅ **Excel + PDF** — تصدير متعدد الأشكال
- ✅ **RLS** — Row Level Security مفعّل على Supabase
- ✅ **Dark Mode + RTL + Mobile**

---

## 🔒 الأمان

- RLS مفعّل على جداول `projects` و `entries`
- الـ `anon key` يقدر يقرأ بس — مش يكتب أو يحذف
- الـ `service_role key` مش موجود في أي ملف frontend

---

## 📅 سجل التغييرات

| الإصدار | التغييرات |
|---------|-----------|
| lft-v151 | تقسيم reports.js + projects.js + ui_comps.js إلى 14 ملف |
| | تفعيل RLS على Supabase |
| | إصلاح حساب إجمالي العهد في الداشبورد |
| | تنظيم config.js بـ section headers |

---

## 🔖 Git Tags

| التاج | الوصف |
|-------|-------|
| `v-stable-before-split` | نسخة مستقرة قبل تقسيم الملفات (commit: f3c90ff) |

---

*Legacy Core — تطوير: محمود مصباح*
