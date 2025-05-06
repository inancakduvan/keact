"use client";

import { useKeact } from "@/packages/keact";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef } from "react";

export default function ProfileForm() {
    const router = useRouter();

    const [name, setName] = useKeact('user_name', () => '');
    const [city, setCity] = useKeact('user_city', () => '');

    const [phoneNumber, setPhoneNumber] = useKeact('phone_number', () => ({
        state_code: '+90',
        number: ''
    }));

    const nameInputRef = useRef<HTMLInputElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);

    const submitForm = (event: FormEvent) => {
        event.preventDefault();
        
        setName(nameInputRef.current?.value || '');
        setCity(cityInputRef.current?.value || '');
        setPhoneNumber({ ...phoneNumber, number: phoneInputRef.current?.value || ''});
    }

    useEffect(() => {
        if (name && city && phoneNumber.number) {
            router.push("/details");
        }
    }, [name, city])

    return <form className="flex flex-col p-4" onSubmit={submitForm}>
        <input ref={nameInputRef} placeholder="Enter your name" className="w-[400px] p-2 border border-gray-200 rounded mb-2" />
        <input ref={cityInputRef} placeholder="Enter city" className="w-[400px] p-2 border border-gray-200 rounded mb-6" />

        <input ref={phoneInputRef} placeholder="Enter phone number" className="w-[400px] p-2 border border-gray-200 rounded mb-6" />

        <button type="submit" className="w-[400px] h-[40px] bg-red-500 text-stone-100 rounded cursor-pointer">Submit</button>
    </form>
}