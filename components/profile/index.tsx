'use client';

import { useKeact } from "@/packages/keact/src"
import { useEffect } from "react";

export default function Profile() {
    const [profileThemeColor, setProfileThemeColor] = useKeact('profile_theme_color', {
        context: 'profile',
        initialValue: 'blue'
    });

    const [firstName] = useKeact('first_name');

    useEffect(() => {
        setTimeout(() => {
            setProfileThemeColor('red');
        }, 3000)
    }, [])

    return <div>
        Profile Page info: <br />
        <b>Theme color:</b> { profileThemeColor } and { firstName }
    </div>
}