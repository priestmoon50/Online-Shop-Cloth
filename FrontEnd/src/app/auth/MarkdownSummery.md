
✅ Summary: سیستم ثبت‌نام و ورود با تأیید ایمیل (Next.js + MongoDB + JWT)
1. ثبت‌نام کاربر (Registration Flow)
📄 RegisterForm.tsx

گرفتن اطلاعات: firstName, lastName, email, phone

اعتبارسنجی سمت کلاینت (با yup)

ارسال POST به /api/auth/register

⏩ انتقال به /verify-message?email=...

2. ذخیره و ارسال لینک تأیید ایمیل
📄 src/app/api/auth/register/route.ts

بررسی تکراری نبودن ایمیل یا تلفن

تولید verificationToken با crypto.randomUUID()

ذخیره کاربر با verified: false در MongoDB

ارسال ایمیل تأیید از طریق Resend

لینک تأیید: /verify?token=...

3. پیام انتظار تأیید ایمیل
📄 verify-message/page.tsx

گرفتن ایمیل از searchParams

نمایش پیام موفق

تایمر برای ارسال مجدد ایمیل

4. تأیید ایمیل با لینک
📄 verify/page.tsx

دریافت token از URL

POST به /api/auth/verify

به‌روزرسانی verified: true در MongoDB

پیام موفق یا خطا

5. ورود با ایمیل
📄 LoginForm.tsx

گرفتن email

ارسال به /api/auth/send-code

پیام "کد برای شما ارسال شد"

انتقال به /verify-code?email=...

6. ارسال و ذخیره کد تأیید
📄 src/app/api/auth/send-code/route.ts

بررسی وجود کاربر و وضعیت verified

تولید کد ۶ رقمی OTP

ذخیره کد در MongoDB با loginCodeExpiresAt

ارسال کد با ایمیل

7. تأیید کد و تولید JWT
📄 VerifyCodeForm.tsx

گرفتن email و code

ارسال به /api/auth/verify-code

📄 src/app/api/auth/verify-code/route.ts

بررسی صحت ایمیل و کد

حذف کد از دیتابیس

تولید توکن JWT (30 روزه)

✅ توکن در localStorage ذخیره می‌شود

⏩ احراز هویت با login(token) در AuthContext

8. مدیریت Session با Context
📄 AuthContext.tsx

بررسی وجود و اعتبار توکن در useEffect

پارس کردن اطلاعات کاربر با jwtDecode

login() → ذخیره توکن و کاربر

logout() → حذف توکن و کاربر

مقدار isAuthenticated, user, token, ready در کل پروژه

9. نمایش وضعیت ورود در UI
📄 AccountMenu.tsx

استفاده از useAuth() برای تعیین ورود یا خروج

نمایش conditionally:

اگر وارد شده → logout, accountSettings

اگر وارد نشده → login, signup

10. محافظت از مسیرهای خصوصی
📄 /account/page.tsx, 📄 /checkout/page.tsx

استفاده از useAuth() و توکن

ارسال توکن به /api/user/me

دریافت اطلاعات کاربر از MongoDB

نمایش پیام خطا در صورت عدم تأیید

🧩 مسیرهای تکمیلی آینده
مرحله	وضعیت	توضیح
✅ AuthContext	کامل	مدیریت session، login/logout
✅ ذخیره توکن	کامل	با localStorage و sync با context
✅ بررسی اولیه session	کامل	در useEffect
✅ وضعیت در AccountMenu	کامل	شرطی‌سازی بر اساس isAuthenticated







