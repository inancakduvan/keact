"use client";

import { useKeact } from "@inancakduvan/keact";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavButton() {
    const [favs] = useKeact('favs', {
        initialValue: []
    })

    return<Link href="/favs"
        className="relative flex items-center justify-center rounded w-[30px] h-[30px] bg-gray-100"
    >
        <Heart fill="black" size={20} />

        <div 
        className="absolute right-[-8px] bottom-[-8px] w-[20px] h-[20px] flex items-center text-xs justify-center rounded-full bg-red-200">
            { favs.length }
        </div>
    </Link>
}