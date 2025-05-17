"use client";

import { MenuIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import { useState } from "react";
import Link from "next/link";
import { CategoriesResponse } from "@/types/types";

export default function MobileMenu({ categories }: { categories: CategoriesResponse }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return <Sheet open={isMenuOpen}>
        <SheetTrigger onClick={() => setIsMenuOpen(true)}><MenuIcon className="md:hidden cursor-pointer" /></SheetTrigger>
        <SheetContent side="left" className="max-w-[80%] w-[400px] sm:w-[540px]">
            <SheetTitle className="sr-only">Mobile Menu</SheetTitle>

            <div onClick={() => setIsMenuOpen(false)} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X size={20} />
                <span className="sr-only">Close</span>
            </div>

            <div>
                <Link href="/demo" className="block mb-6 mt-10 text-gray-600" onClick={() => setIsMenuOpen(false)}>Homepage</Link>

                <div className="font-medium">CATEGORIES</div>
                <div className="flex flex-col gap-2 mt-3">
                    {
                        categories.map((category: string) => <Link key={`@category-${category}`} href={`/demo/category/${category}`} 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-s transition duration-300 hover:opacity-50 text-gray-600">
                            { category }
                        </Link>)
                    }
                </div>
            </div>
        </SheetContent>
    </Sheet>
}
