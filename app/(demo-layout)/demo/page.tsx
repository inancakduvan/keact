import Products from "@/components/products";
import { fetchProducts } from "@/requests";

export default async function Home() {
  const products = await fetchProducts();

  return <Products products={products} />;
}