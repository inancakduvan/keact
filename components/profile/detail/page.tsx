"use client";

import { useKeact } from "@inancakduvan/keact";

export default function DetailPage() {
    const [prerender] = useKeact("prerender");

    return <>{ prerender.length }</>
}