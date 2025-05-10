'use client';

import { useKeact } from "@/packages/keact/src"
import { useRouter } from "next/navigation";
import { FormEvent, useRef } from "react";

export default function Login() {
    const router = useRouter();

    const firstNameInputRef = useRef<HTMLInputElement>(null);

    const [_, setFirstName] = useKeact('first_name', {
        initialValue: ''
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (!firstNameInputRef.current?.value) {
            return;
        }

        setFirstName(firstNameInputRef.current?.value);

        router.push('/details')
    }

    return <form onSubmit={handleSubmit}>
        <input ref={firstNameInputRef} placeholder="First Name" />

        <button type="submit">Login</button>
    </form>
}