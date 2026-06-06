"use client";

import { useKeact } from "@/store";
import { BasketProduct, Product } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
    Boxes,
    DollarSign,
    Heart,
    Layers,
    PackageOpen,
    Plus,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    Trash2,
    Crown,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

/* ----------------------------------------------------------------------------
 * A tiny sample catalog so the page is fully interactive on its own.
 * -------------------------------------------------------------------------- */
const SAMPLE: Product[] = [
    { id: 901, title: "Aurora Headphones", price: 129.9, quantity: 1, description: "Wireless over-ear", category: "electronics", image: "", rating: { rate: 4.6, count: 210 } },
    { id: 902, title: "Linen Shirt", price: 39.5, quantity: 1, description: "Summer fit", category: "men's clothing", image: "", rating: { rate: 4.1, count: 88 } },
    { id: 903, title: "Gold Pendant", price: 249.0, quantity: 1, description: "18k plated", category: "jewelery", image: "", rating: { rate: 4.8, count: 54 } },
    { id: 904, title: "Canvas Tote", price: 24.0, quantity: 1, description: "Everyday bag", category: "women's clothing", image: "", rating: { rate: 4.3, count: 132 } },
    { id: 905, title: "Mechanical Keyboard", price: 89.0, quantity: 1, description: "Hot-swap switches", category: "electronics", image: "", rating: { rate: 4.7, count: 301 } },
];

const pickRandom = () => SAMPLE[Math.floor(Math.random() * SAMPLE.length)];

/* ----------------------------------------------------------------------------
 * Render counter — proves which components actually re-render. A component that
 * bails out via Keact's shallowEqual/Object.is checks will NOT tick.
 * -------------------------------------------------------------------------- */
function useRenderCount() {
    const count = useRef(0);
    count.current += 1;
    return count.current;
}

function StatCard({
    icon,
    label,
    value,
    hint,
    renders,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    hint?: string;
    renders: number;
}) {
    return (
        <div className="relative rounded-xl border bg-white p-4 shadow-xs transition hover:shadow-sm">
            <div
                key={renders}
                className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 animate-[pulse_0.4s_ease-out]"
                title="How many times THIS card has rendered. Watch which cards stay still when you mutate the store."
            >
                ↻ {renders}
            </div>

            <div className="flex items-center gap-2 text-gray-400">
                {icon}
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
            </div>

            <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>

            {hint && <div className="mt-1 text-xs text-gray-400">{hint}</div>}
        </div>
    );
}

/* ----------------------------------------------------------------------------
 * Each card derives its value through a READ-ONLY selector (Keact 1.2.4).
 * `useKeact(selector)` returns a single-element tuple — there is no setter,
 * so these cards literally cannot mutate the store.
 * -------------------------------------------------------------------------- */
function BasketItemsCard() {
    const renders = useRenderCount();
    const [items] = useKeact((s) => (s.basket ?? []).reduce((acc, i) => acc + i.quantity, 0));
    return <StatCard icon={<Boxes size={16} />} label="Items in basket" value={items} renders={renders} hint="sum of quantities" />;
}

function DistinctProductsCard() {
    const renders = useRenderCount();
    const [distinct] = useKeact((s) => (s.basket ?? []).length);
    return <StatCard icon={<PackageOpen size={16} />} label="Distinct products" value={distinct} renders={renders} />;
}

function BasketTotalCard() {
    const renders = useRenderCount();
    const [total] = useKeact((s) => (s.basket ?? []).reduce((acc, i) => acc + i.price * i.quantity, 0));
    return <StatCard icon={<DollarSign size={16} />} label="Basket total" value={`$${total.toFixed(2)}`} renders={renders} />;
}

function FavoritesCard() {
    const renders = useRenderCount();
    const [favs] = useKeact((s) => (s.favs ?? []).length);
    return <StatCard icon={<Heart size={16} />} label="Favorites" value={favs} renders={renders} hint="unaffected by basket writes" />;
}

function TopCategoryCard() {
    const renders = useRenderCount();
    const [category] = useKeact((s) => {
        const counts: Record<string, number> = {};
        for (const i of s.basket ?? []) counts[i.category] = (counts[i.category] ?? 0) + i.quantity;
        let top = "—";
        let max = 0;
        for (const [c, n] of Object.entries(counts)) if (n > max) { max = n; top = c; }
        return top;
    });
    return <StatCard icon={<Layers size={16} />} label="Top category" value={category} renders={renders} />;
}

function PriciestItemCard() {
    const renders = useRenderCount();
    // Returns a fresh object every call — exercises Keact's shallowEqual cache,
    // so this card still bails out (no re-render) while the result is unchanged.
    const [priciest] = useKeact((s) => {
        const basket = s.basket ?? [];
        if (basket.length === 0) return { title: "—", price: 0 };
        const top = basket.reduce((a, b) => (b.price > a.price ? b : a));
        return { title: top.title, price: top.price };
    });
    return (
        <StatCard
            icon={<Crown size={16} />}
            label="Priciest item"
            value={priciest.title}
            renders={renders}
            hint={priciest.price ? `$${priciest.price.toFixed(2)}` : undefined}
        />
    );
}

/* ----------------------------------------------------------------------------
 * Control panel — the ONLY place with write access (key-path access returns a
 * setter). Mutations here ripple out to the selector cards above.
 * -------------------------------------------------------------------------- */
function ControlPanel() {
    const [basket, setBasket] = useKeact("basket", { initialValue: [] });
    const [favs, setFavs] = useKeact("favs", { initialValue: [] });
    const renders = useRenderCount();

    const addRandom = () => {
        const product = pickRandom();
        const existing = basket.find((i) => i.id === product.id);
        if (existing) {
            setBasket(basket.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)));
        } else {
            setBasket([...basket, { ...product, quantity: 1 } as BasketProduct]);
        }
    };

    const toggleFav = () => {
        const product = pickRandom();
        const exists = favs.find((i) => i.id === product.id);
        setFavs(exists ? favs.filter((i) => i.id !== product.id) : [...favs, product]);
    };

    // Returns the SAME reference -> Object.is bailout -> nothing re-renders.
    const noOp = () => setBasket((prev) => prev);

    const clearAll = () => {
        setBasket([]);
        setFavs([]);
    };

    return (
        <div className="rounded-xl border bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Control panel · key-path access (has setter)</span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-600">↻ {renders}</span>
            </div>

            <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={addRandom}><Plus size={14} /> Add random item</Button>
                <Button size="sm" variant="secondary" onClick={toggleFav}><Heart size={14} /> Toggle a favorite</Button>
                <Button size="sm" variant="outline" onClick={noOp}><ShieldCheck size={14} /> Set same value (no-op)</Button>
                <Button size="sm" variant="ghost" className="text-red-500" onClick={clearAll}><Trash2 size={14} /> Clear all</Button>
            </div>

            <p className="mt-3 text-xs text-gray-500">
                Tip: <strong>Add random item</strong> ticks only the basket-related cards. <strong>Toggle a favorite</strong> ticks only the
                Favorites card. <strong>Set same value</strong> ticks <em>nothing</em> — that&apos;s the <code>Object.is</code> write bailout.
            </p>
        </div>
    );
}

export default function Insights() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-10">
            <div className="flex items-center gap-2 text-indigo-600">
                <Sparkles size={18} />
                <span className="text-xs font-semibold uppercase tracking-wide">Keact 1.2.4 · live demo</span>
            </div>

            <h1 className="mt-2 text-2xl font-bold text-gray-900">Live Store Insights</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Every stat below is derived with a <strong>read-only selector</strong> — <code>useKeact(s =&gt; …)</code> returns a one-element
                tuple with <em>no setter</em>. Mutate the store from the control panel and watch the <span className="text-indigo-600">↻ counters</span>:
                only the cards whose value actually changed re-render. The rest bail out.
            </p>

            <div className="mt-6">
                <ControlPanel />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <BasketItemsCard />
                <DistinctProductsCard />
                <BasketTotalCard />
                <FavoritesCard />
                <TopCategoryCard />
                <PriciestItemCard />
            </div>

            <div className="mt-8 rounded-xl border bg-gray-900 p-4 text-xs leading-relaxed text-gray-300">
                <div className="mb-2 font-medium text-gray-400">// read-only selector — try to set and it won&apos;t compile</div>
                <pre className="overflow-x-auto">
{`const [total] = useKeact(s => s.basket.reduce((a, i) => a + i.price * i.quantity, 0));
//      ^ no setter — selector tuples are [value] in 1.2.4

const [basket, setBasket] = useKeact('basket'); // key-path keeps its setter`}
                </pre>
            </div>

            <div className="mt-4 text-center">
                <Link href="/demo" className="text-sm text-indigo-600 underline">Browse products to populate the store →</Link>
            </div>
        </div>
    );
}
