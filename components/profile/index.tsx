'use client';

import { useKeact } from "@/packages/keact/src"
import { useKeactContext } from "@/packages/keact/src/keact";

export default function Profile() {
    const [profileThemeColor, setProfileThemeColor] = useKeactContext('profile_theme_color', 'profile', {
        initialValue: 'blue'
    });

    const [firstName] = useKeact('first_name');

    return <div>
        Profile Page info: <br />
        <b>Theme color:</b> { profileThemeColor } and { firstName }
    </div>
}