import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Product } from "@/data/types";
import Image from "next/image";

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get("/api/products"); // ✅ استفاده از API داخلی
  return data;
};

export const AllProducts = () => {
  const { data: products = [], isLoading, error } = useQuery<Product[], Error>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching products</div>;

  return (
    <div>
      {products.map((product) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            marginBottom: "20px",
            padding: "10px",
          }}
        >
          <h2>{product.name}</h2>
          <div>Price: {product.price}</div>
          <div>Description: {product.description}</div>

          {Array.isArray(product.images) && product.images.length > 0 && (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={100}
              height={100}
            />
          )}

          {product.variants && product.variants.length > 0 && (

            <div>
              Variants:
              <ul>
                {product.variants.map((v, i) => (
                  <li key={i}>
                    Size: {v.size}, Color: {v.color} — {v.stock} in stock
                  </li>
                ))}
              </ul>

            </div>
          )}

          {product.category && <div>Category: {product.category}</div>}
        </div>
      ))}
    </div>
  );
};
