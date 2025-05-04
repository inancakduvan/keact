"use client";

import { useKeact } from "@/packages/keact";

export default function ProfileDetails() {
    const [name] = useKeact('user_name');
    const [city] = useKeact('user_city');

    if (!name || !city) {
        return <p>Profile info is not completed yet.</p>
    }

    return <p>{name} is from {city}</p>
}