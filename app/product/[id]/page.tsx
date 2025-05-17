import ProductItem from "@/components/products/item";
import { fetchProduct } from "@/requests";

export default async function ProductPage({ params }: { params: Promise<{id: string}>}) {
    const product = await fetchProduct((await params).id);

    return <div className="p-4 md:p-10">
        <ProductItem product={product} />
    </div>
}