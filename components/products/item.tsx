"use client";

import { Product } from "@/types/types";
import { Button } from "../ui/button";
import { useKeact } from "@inancakduvan/keact";
import { Heart, Minus, Plus } from "lucide-react";
import Link from "next/link";

export default function ProductItem({ product }: { product: Product }) {
    const [basket, setBasket] = useKeact('basket');
    const [favs, setFavs] = useKeact('favs');

    const targetProduct = basket.find((item) => item.id === product.id);
    const productInFavs = favs.find((item) => item.id === product.id);

    const addToBasket = () => {
        if (targetProduct) {
            const updatedBasket = [...basket].map((item) => {
                if (item.id === targetProduct.id) {
                    return { ...item, quantity: targetProduct.quantity + 1 }
                }

                return item;
            })

            setBasket(updatedBasket);
        } else {
            setBasket([...basket, {
                id: product.id,
                title: product.title,
                price: product.price,
                quantity: 1
            }])
        }
    }
    
    const removeFromBasket = () => {
        if (targetProduct) {
            if (targetProduct.quantity > 1) {
                const updatedBasket = [...basket].map((item) => {
                    if (item.id === targetProduct.id) {
                        return { ...item, quantity: targetProduct.quantity - 1 }
                    }

                    return item;
                })

                setBasket(updatedBasket);
            } else {
                setBasket([...basket].filter((item) => item.id !== targetProduct.id));
            }
        }
    }

    const toggleFav = () => {
        if (productInFavs) {
            setFavs([...favs].filter((item) => item.id !== productInFavs.id));
        } else {
            setFavs([...favs, product])
        }
    }

    return <div className="relative border-1 rounded-md shadow-xs">
        <div className="absolute right-4 top-4 cursor-pointer">
            <Heart size={20} fill={productInFavs ? "black" : "transparent"} onClick={toggleFav} />
        </div>

        <Link href={`product/${product.id}`}>
            <div className="flex items-center justify-center border-b-1 p-4">
                <img src={product.image} className="max-h-[100px]" />
            </div>

            <div className="p-2">
                <div className="pr-4 text-xs font-medium text-nowrap overflow-hidden text-ellipsis">{ product.title }</div>

                <div className="mt-2 text-gray-500 text-xs line-clamp-2 overflow-hidden text-ellipsis">{ product.description }</div>
            </div>
        </Link>

        <div className="flex items-center justify-between p-2 mt-2">
            <div className="font-medium text-md">{ product.price } $</div>

            {
                targetProduct ?
                <div className="flex border-1 rounded overflow-hidden">
                    <div className="flex items-center justify-center w-[30px] h-[30px] bg-gray-100 cursor-pointer" onClick={removeFromBasket}><Minus size={16} /></div>

                    <div className="flex items-center justify-center px-4 text-sm">{ targetProduct.quantity }</div>

                    <div className="flex items-center justify-center w-[30px] h-[30px] bg-gray-100 cursor-pointer" onClick={addToBasket}><Plus size={16} /></div>
                </div>
                :
                <Button size='sm' className="text-xs" onClick={addToBasket}>Add to Basket</Button>
            }
        </div>
    </div>
}
