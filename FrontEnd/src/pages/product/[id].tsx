// 📁 FrontEnd/src/pages/product/[id].tsx

import Layout from '@/app/layout';
import ProductDetails from '@/components/ProductDetails/ProductDetails';
import { GetServerSideProps, NextPage } from 'next';
import { Product } from '@/data/types';

interface ProductPageProps {
  product: Product | null;
}

const ProductPage: NextPage<ProductPageProps> = ({ product }) => {
  if (!product) {
    return (
      <Layout>
        <div style={{ padding: '50px', textAlign: 'center' }}>
          <h2>Product not found</h2>
        </div>
      </Layout>
    );
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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/products/${id}`);

    if (!res.ok) {
      return { notFound: true };
    }

    const product: Product = await res.json();

    return {
      props: {
        product,
      },
    };
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return {
      props: {
        product: null,
      },
    };
  }
};

export default ProductPage;
