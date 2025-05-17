"use client";

import { useKeact } from "@/packages/keact/src";
import { ShoppingBasketIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function BasketButton() {
    const [basket] = useKeact('basket', {
        initialValue: []
    })

    const basketCount = useMemo(() => {
        return basket.reduce((acc, current) => acc + (current.quantity), 0);
    }, [basket])

    return<Link 
        href="/demo/basket"
        className="relative flex items-center justify-center rounded w-[30px] h-[30px] bg-gray-100"
    >
        <ShoppingBasketIcon size={20} />

        <div 
        className="absolute right-[-8px] bottom-[-8px] w-[20px] h-[20px] flex items-center text-xs justify-center rounded-full bg-red-200">
            { basketCount }
        </div>
    </Link>
}