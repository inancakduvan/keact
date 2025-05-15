import { fetchCategories } from "@/requests"
import Link from "next/link";
import BasketButton from "./basket-button";

export default async function Header() {
    const categories = await fetchCategories();

    return <div className="flex items-center justify-between border-b py-4 px-10 shadow-none">
        <div className="flex items-center gap-8">
            {
                categories.map((category: string) => <Link key={`@category-${category}`} href={`/category/${category}`} 
                    className="text-s font-medium transition duration-300 hover:opacity-50">
                    { category }
                </Link>)
            }
        </div>
        
        <div className="flex">
            <BasketButton />
        </div>
    </div>
}
