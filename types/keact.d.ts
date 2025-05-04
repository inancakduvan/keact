import { KeactTypeRegistry } from '@/packages/keact';

declare module '@/packages/keact' {
  interface KeactTypeRegistry {
    user_name: string;
    user_city: string;
  }
}
