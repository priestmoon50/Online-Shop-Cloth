✅ Summary: سیستم ثبت‌نام و ورود با تأیید ایمیل (Next.js Fullstack)
1. ثبت‌نام (Registration Flow)
📄 RegisterForm.tsx
گرفتن اطلاعات کاربر: firstName, lastName, email, phone

اعتبارسنجی کلاینتی (Client-side)

ارسال درخواست به API /api/auth/register

پس از ثبت موفق، انتقال به صفحه /verify-message?email=...

2. ارسال لینک تأیید ایمیل
📄 /api/auth/register/route.ts
بررسی تکراری نبودن email یا phone

ساخت توکن تأیید verificationToken با crypto.uuid

ذخیره کاربر در MongoDB با فیلد verified: false

ارسال ایمیل تأیید به کاربر با Resend API:

لینک: /verify?token=...

3. نمایش پیام انتظار تأیید ایمیل
📄 verify-message/page.tsx
دریافت ایمیل از searchParams

پیام: "ایمیل تأیید برای شما ارسال شد"

قابلیت ارسال مجدد ایمیل با تایمر یک دقیقه‌ای

4. تأیید ایمیل با لینک
📄 verify/page.tsx
گرفتن token از URL

درخواست POST به /api/auth/verify

تغییر فیلد verified به true در دیتابیس

پیام موفقیت یا شکست تأیید ایمیل

5. ورود با ایمیل (مرحله اول)
📄 LoginForm.tsx
گرفتن email

ارسال درخواست به /api/auth/send-code

پیام: "کد تأیید به ایمیل شما ارسال شد"

انتقال به /verify-code?email=...

6. ارسال کد تأیید
📄 /api/auth/send-code/route.ts
بررسی وجود و تأیید بودن ایمیل

تولید کد ۶ رقمی (OTP) و ذخیره در MongoDB با expiresAt

ارسال ایمیل حاوی کد

7. تأیید کد و تولید توکن
📄 VerifyCodeForm.tsx
گرفتن email و code از کاربر

ارسال به /api/auth/verify-code

📄 /api/auth/verify-code/route.ts
بررسی وجود ایمیل و صحت کد

تولید JWT با jsonwebtoken

برگشت توکن به کلاینت

🔐 مرحله بعدی (بعد از تایید کد):
8. مدیریت Session با LocalStorage یا HttpOnly Cookie
ذخیره توکن در localStorage برای 30 روز

بررسی در useEffect که اگر توکن معتبر وجود دارد، کاربر را لاگین‌شده نگه دارد

ساخت Context برای مدیریت authUser در کل پروژه

🧩 مسیر ادامه:
مرحله	توضیح
✅ مرحله بعدی	ساخت Context برای احراز هویت (AuthContext) و ذخیره توکن
✅ بررسی session در لود اولیه صفحه (hydration)	
⏳ قابلیت خروج (Logout)	
⏳ محافظت از مسیرهای خصوصی (/account, /checkout)	
⏳ ارسال توکن در Authorization header به APIها	
⏳ افزودن expiration برای session (مثلاً 30 روز)	
⏳ افزودن صفحه فراموشی رمز با ارسال مجدد کد یا لینک	

