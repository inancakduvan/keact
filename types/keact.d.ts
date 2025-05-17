import '@/packages/keact/src';
import { BasketProduct, ProductsResponse } from './types';

declare module '@/packages/keact/src' {
  interface KeactTypeRegistry {
    basket: Array<BasketProduct>,
    favs: ProductsResponse
  }
}
