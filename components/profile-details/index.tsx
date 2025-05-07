"use client";

import { useKeact } from "@inancakduvan/keact";
import { useRouter } from "next/navigation";

export default function ProfileDetails() {
    const router = useRouter();

    const [name] = useKeact('user_name');
    const [city] = useKeact('user_city');
    const [phoneNumber] = useKeact('phone_number');

    return <> {
        (!name || !city || !phoneNumber || !phoneNumber.number) ? 
        <p>Profile info is not completed yet.</p> 
        : 
        <p>{name} is from {city}. Our service will call you via number {phoneNumber.state_code} {phoneNumber.number}</p>
    }
    
    <button onClick={() => router.push("/")}>Go back to home</button>
    </>
}