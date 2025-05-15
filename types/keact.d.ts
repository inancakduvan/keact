import '@inancakduvan/keact';
import { BasketProduct } from './types';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    basket: Array<BasketProduct>
  }
}
