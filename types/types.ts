/* Responses */
export type CategoriesResponse = Category[];
export type CategoryDetailResponse = Product[];
export type ProductDetailResponse = Product;
export type ProductsResponse = Product[];

export type Category = string;

export interface BasketProduct {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export interface Product extends Omit<BasketProduct, "quantity"> {
  description: string;
  category: Category;
  image: string;
  rating: { rate: number; count: number };
}
