'use client';

import React from 'react';

/**
 * HOC برای پیچیدن یک کامپوننت بدون هیچ محدودیت دسترسی.
 * فعلاً برای توسعه استفاده می‌شود تا دسترسی ادمین حذف شود.
 */
const withAdminAccess = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AdminAccessComponent: React.FC<P> = (props) => {
    return <WrappedComponent {...props} />;
  };

  return AdminAccessComponent;
};

export default withAdminAccess;
