"use client";

import Products from "@/components/products";
import { useKeact } from "@inancakduvan/keact";

export default function Favs() {
    const [favs] = useKeact("favs");

    return <Products products={favs} />
}