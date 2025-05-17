import ProductItem from "@/components/products/item";
import { fetchProduct } from "@/requests";

export default async function ProductPage({ params }: { params: Promise<{id: string}>}) {
    const product = await fetchProduct((await params).id);

    return <div className="p-4 md:p-10">
        <div className="font-bold mb-4 md:mb-10">{product.title.toUpperCase()}</div>

        <ProductItem product={product} />
    </div>
}