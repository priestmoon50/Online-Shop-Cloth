✅ خلاصه پیاده‌سازی سیستم کد تخفیف و مدیریت سایز/تعداد محصول در سبد خرید
🧩 ساختار کلی پروژه:
Frontend: Next.js (App Router) + React + MUI + Zustand + axios

Backend (API Routes): Next.js API (/src/app/api/**)

Database: MongoDB Atlas (با اتصال از طریق utils/mongo.ts)

🟦 مدیریت سایز و تعداد هر محصول در سبد خرید
📄 CartItem در @/data/types.ts:
ts
Copy
Edit
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  variants: {
    size: string;
    color?: string;
    quantity: number;
  }[];
}
📄 CartContext.tsx
از useReducer استفاده شده و حالت cart.items شامل لیست CartItem با آرایه variants است.

متدهای: addItem, removeItem, updateItem, clearCart تعریف شده‌اند.

همچنین شامل couponCode, setCouponCode, discountPercent, setDiscountPercent.

🟨 نمایش محصولات در سبد خرید (/components/Cart.tsx)
در نمایش، به جای item.quantity، از:

tsx
Copy
Edit
item.variants.map((variant) => (
  <>
    Size: {variant.size} - Qty: {variant.quantity}
  </>
))
استفاده شده.

جمع کل به صورت:

ts
Copy
Edit
item.variants.reduce((sum, v) => sum + Number(item.price) * v.quantity, 0)
🟩 Checkout (/app/checkout/page.tsx)
سبد خرید با همان variants بررسی می‌شود.

محاسبه قیمت نهایی با اعمال تخفیف:

ts
Copy
Edit
const rawTotal = cart.items.reduce(
  (acc, item) =>
    acc + item.variants.reduce(
      (sum, v) => sum + Number(item.price) * v.quantity,
      0
    ),
  0
);
const totalPrice = rawTotal * (1 - discountPercent / 100);
🟥 پیاده‌سازی سیستم کد تخفیف
📄 API Routes:
1. /api/discounts/route.ts
GET: دریافت لیست کدها

POST: افزودن کد تخفیف (با تاریخ انقضا و درصد)

2. /api/discounts/validate/route.ts
GET: اعتبارسنجی کد بر اساس ?code=...

اگر expiresAt < now → برگشت خطای "کد منقضی شده است"

🟪 صفحه ادمین کد تخفیف (/app/admin/discounts/page.tsx)
فرم افزودن کد + درصد

نمایش لیست تخفیف‌های موجود با createdAt و expiresAt

قابلیت حذف تخفیف (در نسخه کامل پیاده‌سازی شده)

⚙️ ابزارهای استفاده‌شده:
axios: ارسال درخواست به API

Zustand: مدیریت گلوبال cart و discount

react-hook-form + yup: ولیدیشن در Checkout

react-hot-toast: پیام‌های موفقیت/خطا

✍️ خلاصه نهایی (Prompt-ready):
پروژه‌ای فروشگاهی با سبد خرید چندسایزی، که هر آیتم می‌تواند چند سایز با تعدادهای مختلف داشته باشد (variants). مدیریت سبد با Zustand انجام شده. برای هر سفارش در مرحله Checkout، قیمت کل با اعمال درصد تخفیف از کدی که از طریق /api/discounts/validate اعتبارسنجی شده محاسبه می‌شود. صفحه ادمین کد تخفیف امکان افزودن و حذف کد را دارد. از MongoDB برای ذخیره اطلاعات استفاده شده و همه‌چیز در API Routes Next.js پیاده‌سازی شده است.

