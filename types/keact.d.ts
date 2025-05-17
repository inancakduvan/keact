import '@inancakduvan/keact';
import { BasketProduct, ProductsResponse } from './types';

declare module '@inancakduvan/keact' {
  interface KeactTypeRegistry {
    basket: Array<BasketProduct>,
    favs: ProductsResponse,
    prerender: Array<string>
  }
}
