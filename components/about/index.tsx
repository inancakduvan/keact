'use client';

import { useKeact } from "@/packages/keact/src"

export default function About() {
    const [firstName] = useKeact('first_name');

    return <div>
        <br /> <br /> About info: <br />
        <b>Name:</b> { firstName}
    </div>
}