'use client';

import { useKeact } from "@/packages/keact/src"

export default function Profile() {
    const [profileThemeColor, setProfileThemeColor] = useKeact('profile_theme_color', {
        context: 'profile',
        initialValue: 'blue'
    });

    const [firstName] = useKeact('first_name');

    return <div>
        Profile Page info: <br />
        <b>Theme color:</b> { profileThemeColor } and { firstName }
    </div>
}