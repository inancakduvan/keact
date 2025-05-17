"use client";

import { useKeact } from "@inancakduvan/keact";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function Payment() {
    const [, setBasket] = useKeact('basket');

    useEffect(() => {
        setBasket([]);
    }, [])

    return <div className="mt-20 flex items-center justify-center flex-col p-4 md:p-10">
        <CheckCircle size={60} className="text-green-400" />

        <div className="mt-10 text-lg font-medium text-center">
            Your payment is successful!
            <Link href="/demo" className="block mt-4 text-indigo-600 underline">Go back to home</Link>
        </div>
    </div>
}