'use client';

import { useKeact } from "@/packages/keact/src"
import { useKeactContext } from "@/packages/keact/src/keact";

export default function About() {
    const [profileThemeColor, setProfileThemeColor] = useKeactContext('profile_theme_color', 'profile');

    const [firstName] = useKeact('first_name');

    return <div>
        <br /> <br /> About info: <br />
        <b>Theme color:</b> { profileThemeColor || 'yok' } and { firstName}
    </div>
}