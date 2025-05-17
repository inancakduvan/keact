import { fetchCategories } from "@/requests"
import Link from "next/link";
import BasketButton from "./basket-button";
import FavButton from "./fav-button";
import MobileMenu from "./mobile-menu";

export default async function Header() {
    const categories = await fetchCategories();

    return <div className="z-10 sticky left-0 top-0 bg-white flex items-center justify-between border-b py-4 px-4 md:px-10 shadow-none">
        <div className="hidden md:flex items-center gap-8">
            <Link href="/demo" className="flex items-center justify-center bg-gray-100 w-[30px] h-[30px] rounded border-1">
                <img src="https://res.cloudinary.com/dnjvyciqt/image/upload/v1746882540/taelwwhffuou9qlblvy1.png"
                    className="w-[12px] translate-y-[1px]"
                />
            </Link>

            {
                categories.map((category: string) => <Link key={`@category-${category}`} href={`/demo/category/${category}`} 
                    className="text-s font-medium transition duration-300 hover:opacity-50">
                    { category }
                </Link>)
            }
        </div>

        <MobileMenu categories={categories} />
        
        <div className="flex gap-4">
            <FavButton />
            <BasketButton />
        </div>
    </div>
}
