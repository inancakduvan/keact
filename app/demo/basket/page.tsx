"use client";

import Products from "@/components/products";
import { Button } from "@/components/ui/button";
import { useKeact } from "@inancakduvan/keact";
import Link from "next/link";
import { useMemo } from "react";

export default function Basket() {
    const [basket] = useKeact("basket");

    const totalPrice = useMemo(() => basket ? basket.reduce((acc, current) => acc + (current.price * current.quantity), 0) : 0, [basket]);

    return <>
        <div className="font-bold px-4 md:px-10 mt-4 md:mt-10">BASKET</div>

        {
            basket && basket.length > 0 ?
            <div className="pb-[72px]">
                <Products products={basket} isBasket={true} />

                <div className="z-10 fixed left-0 bottom-0 flex items-center justify-end gap-10 w-full py-4 px-4 md:px-10 font-medium text-left bg-white border-t-1">
                    <div className="flex flex-col">
                        <span className="block text-xs text-gray-400 font-regular">Total price</span>
                        <span>{ totalPrice.toFixed(2) } $</span>
                    </div>

                    <Link href="/demo/payment">
                        <Button>Complete Payment</Button>
                    </Link>
                </div>
            </div>
            :
            <div className="p-4 md:p-10">You dont have any item on your basket yet! <br /> <Link href="/demo" className="text-indigo-600 underline">Go back to home</Link></div>
        }
    </>
}