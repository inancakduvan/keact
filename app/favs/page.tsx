"use client";

import Products from "@/components/products";
import { useKeact } from "@inancakduvan/keact";
import Link from "next/link";

export default function Favs() {
    const [favs] = useKeact("favs");

    return <>
        {
            favs && favs.length > 0 ?
            <Products products={favs} />
            :
            <div className="p-4 md:p-10">You dont have any item in your favs yet! <br /> <Link href="/" className="text-indigo-600 underline">Go back to home</Link></div>
        }
    </>


}