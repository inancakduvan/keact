import ProductItem from "./item";
import { ProductsResponse } from "@/types/types";

export default function Products({ products }: { products: ProductsResponse}) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-10">
        {
            products.map((product) => <ProductItem key={`@product-${product.id}`} product={product} />)
        }
    </div>
}