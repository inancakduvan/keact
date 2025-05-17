import Products from "@/components/products";
import { fetchCategory } from "@/requests"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string}>;
}) {
    const searchParams = await params;
    const category = await fetchCategory(searchParams.category);

      return <>
        <div className="font-bold px-4 md:px-10 mt-4 md:mt-10">{searchParams.category.toUpperCase()}</div>

        <Products products={category} />
      </>
}
