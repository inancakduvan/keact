import { fetchProducts } from "@/requests";
import ProductItem from "./item";

export default async function Products() {
    const products = await fetchProducts();

    return <div className="grid grid-cols-4 gap-4 p-10">
        {
            products.map((product) => <ProductItem key={`@product-${product.id}`} product={product} />)
        }
    </div>
}