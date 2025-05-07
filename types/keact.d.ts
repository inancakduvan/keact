import { KeactTypeRegistry } from '@inancakduvan/keact';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    user_name: string;
    user_city: string;
    phone_number: {
      state_code: string;
      number: string;
    }  
  }
}
