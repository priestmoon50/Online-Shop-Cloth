✅ Roadmap: ویرایش دسته‌بندی‌ها با تصویر در پنل ادمین
📌 هدف نهایی:
کاربر ادمین بتواند در صفحه /admin/category-links، عکس دسته‌بندی‌ها را انتخاب و آپدیت کند (با Cloudinary)، و بخش CategoryLinks.tsx از دیتابیس بخواند.

✅ مرحله 1: ساخت مدل MongoDB برای دسته‌بندی‌ها
ساخت کالکشن categoryLinks شامل:

title: شناسه دسته‌بندی (مثل "pants", "sale", ...)

imageUrl: لینک عکس

📁 فایل: models/categoryLink.ts (یا فقط ساختار TypeScript interface)

✅ مرحله 2: ایجاد API برای مدیریت دسته‌بندی‌ها
📁 مسیر: src/app/api/category-links/route.ts

GET: دریافت لیست همه دسته‌ها

POST: اضافه‌کردن دسته (اختیاری)

PUT: ویرایش تصویر دسته با id

✅ مرحله 3: صفحه ادمین /admin/category-links
📁 مسیر: src/app/admin/category-links/page.tsx

در این صفحه:

گرفتن دیتا با GET /api/category-links

نمایش هر دسته با title و image

دکمه "تغییر عکس" → باز شدن Gallery selector

دکمه "ذخیره تغییر" → ارسال PUT /api/category-links/:id

✅ مرحله 4: استفاده از دیتا در کامپوننت CategoryLinks.tsx
📁 مسیر: src/components/CategoryLinks.tsx

حذف آرایه‌ی هاردکد‌شده

گرفتن دسته‌ها از API (GET /api/category-links)

نمایش مشابه قبل (با همان ظاهر)

✅ مرحله 5: مدیریت fallback
اگر تصویر نداشت → نمایش /placeholder.jpg

اگر دیتایی در DB نبود → نمایش هیچ‌چیز یا پیام

✅ مرحله 6 (اختیاری): افزودن امکان اضافه‌کردن دسته جدید
فرم ساده برای افزودن دسته (title + انتخاب تصویر)

POST /api/category-links

