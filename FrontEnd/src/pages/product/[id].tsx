import Layout from '@/app/layout';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import { GetServerSideProps, NextPage } from 'next';
import { Product } from '@/data/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ProductPageProps {
  product: Product | null;
}

const ProductPage: NextPage<ProductPageProps> = ({ product }) => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If product is null or not found, redirect to a 404 page
  if (!product) {
    if (typeof window !== 'undefined') {
      router.push('/404'); // Optional: Custom 404 page
    }
    return null;
  }

  if (!isMounted) {
    return null; // Prevent hydration issues
  }

  return (
    <Layout>
      <ProductDetails product={product} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  try {
    // Fetch product from API
    const res = await fetch(`http://localhost:3000/api/products/${id}`);

    // If product not found, return 404
    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const product: Product = await res.json();

    return {
      props: {
        product,
      },
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return {
      props: {
        product: null,
      },
    };
  }
};

export default ProductPage;
