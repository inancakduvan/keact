import { KeactTypeRegistry } from '@/packages/keact/src';

declare module '@/packages/keact/src' {
  interface KeactTypeRegistry {
    first_name: string;
    is_user_logged_in: boolean;
    profile: {
      profile_theme_color: string;
    };
  }
}
