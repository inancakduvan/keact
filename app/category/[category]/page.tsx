import Products from "@/components/products";
import { fetchCategory } from "@/requests"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string}>;
}) {
    const category = await fetchCategory((await params).category);

    return <Products products={category} />
}
