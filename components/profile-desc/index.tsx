import { useKeact } from "@/packages/keact/src";

export const ProfileDesc = () => {
    const [profileDescription] = useKeact('profile_description', {
        context: 'about',
    });

    return "profileDesc " + profileDescription
}