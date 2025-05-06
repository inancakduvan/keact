"use client";

import { useKeact } from "@/packages/keact";

export default function ProfileDetails() {
    const [name] = useKeact('user_name');
    const [city] = useKeact('user_city');
    const [phoneNumber] = useKeact('phone_number');

    if (!name || !city || !phoneNumber || !phoneNumber.number) {
        return <p>Profile info is not completed yet.</p>
    }

    return <p>{name} is from {city}. Our service will call you via number {phoneNumber.state_code} {phoneNumber.number}</p>
}