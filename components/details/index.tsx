'use client';

import { KeactContext, useKeact } from "@/packages/keact/src"
import Profile from "../profile";
import About from "../about";
import Link from "next/link";
import { ProfileDesc } from "../profile-desc";

export default function Details() {
    const [isUserLoggedIn] = useKeact('is_user_logged_in', {
        initialValue: true
    });

    const [firstName] = useKeact('first_name');

    return <div>
        Here are some details: <br />
        <b>First name:</b> { firstName }, is Loggedin? = {isUserLoggedIn.toString()}

        <KeactContext name="profile">
            <Profile />
        </KeactContext>

        <KeactContext name="about">
            <About />
            <ProfileDesc />
        </KeactContext>

        <br /><br />

        <Link href="/"> Go to home</Link>
    </div>
}