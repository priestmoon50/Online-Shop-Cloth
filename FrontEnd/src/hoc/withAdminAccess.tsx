'use client';  // برای استفاده از سمت کلاینت

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // استفاده از سیستم مسیریابی جدید Next.js

const withAdminAccess = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  return function AdminAccessComponent(props: P) { // تایپ props به P که تایپ عمومی است تغییر یافت
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      // بررسی اینکه آیا window وجود دارد (برای جلوگیری از خطاهای SSR)
      if (typeof window !== 'undefined') {
        // دریافت role کاربر از localStorage
        const userRole = localStorage.getItem('role');
        console.log('User role:', userRole);
        // اگر نقش کاربر admin نیست، او را به صفحه دیگری هدایت کن
        if (userRole !== 'admin') {
          router.push('/'); // هدایت به صفحه اصلی
        } else {
          setLoading(false); // وقتی نقش admin باشد، بارگذاری تمام می‌شود
        }
      }
    }, [router]);

    // در حال بارگذاری: هیچ چیز نمایش نده تا زمانی که نقش بررسی شود
    if (loading) {
      return <div>Loading...</div>;
    }

    // نمایش کامپوننت محافظت‌شده در صورتی که کاربر admin باشد
    return <WrappedComponent {...props} />;
  };
};

export default withAdminAccess;
