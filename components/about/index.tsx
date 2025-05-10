'use client';

import { useKeact } from "@/packages/keact/src"

export default function About() {
    const [profileThemeColor, setProfileThemeColor] = useKeact('profile_theme_color', {
        context: 'profile'
    });

    const [firstName] = useKeact('first_name');

    return <div>
        <br /> <br /> About info: <br />
        <b>Theme color:</b> { profileThemeColor || 'yok' } and { firstName}
    </div>
}