"use client";

import Products from "@/components/products";
import { useKeact } from "@inancakduvan/keact";
import Link from "next/link";
import { useMemo } from "react";

export default function Basket() {
    const [basket] = useKeact("basket");

    const totalPrice = useMemo(() => basket.reduce((acc, current) => acc + (current.price * current.quantity), 0), [basket]);

    return <>
        {
            basket && basket.length > 0 ?
            <div className="pb-[72px]">
                <Products products={basket} isBasket={true} />

                <div className="z-10 fixed left-0 bottom-0 flex flex-col items-end justify-center w-full py-4 px-4 md:px-10 font-medium text-right bg-white border-t-1">
                    <span className="block text-xs text-gray-400 font-regular">Total price:</span>
                    <span>{ totalPrice.toFixed(2) } $</span>
                </div>
            </div>
            :
            <div className="p-4 md:p-10">You dont have any item on your basket yet! <br /> <Link href="/" className="text-indigo-600 underline">Go to home</Link></div>
        }
    </>
}