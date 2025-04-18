// 📁 FrontEnd/src/app/product/[id]/page.tsx

import { Product } from '@/data/types';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const numericId = Number(params.id);

  if (isNaN(numericId)) {
    return notFound(); // اگر آیدی معتبر نیست، 404
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${numericId}`, {
      cache: 'no-store', // مثل getServerSideProps
    });

    if (!res.ok) {
      return notFound();
    }

    const product: Product = await res.json();

    return (
      <div style={{ padding: 40 }}>
        <ProductDetails product={product} />
      </div>
    );
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return notFound();
  }
}
