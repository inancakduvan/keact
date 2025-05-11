'use client';

import { useKeact } from "@/packages/keact/src"

export default function About() {
    const [profileDescription] = useKeact('profile_description', {
        context: 'about',
        initialValue: 'that is me!'
    });

    const [firstName] = useKeact('first_name');

    return <div>
        <br /> <br /> About info: <br />
        <b>Name:</b> { firstName} and { profileDescription }
    </div>
}