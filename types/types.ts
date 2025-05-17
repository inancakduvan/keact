/* Responses */
export type CategoriesResponse = Category[];
export type CategoryDetailResponse = Product[];
export type ProductDetailResponse = Product;
export type ProductsResponse = Product[];

export type Category = string;

export interface BasketProduct extends Product {
  quantity: number;
}

export interface Product {
  id: number;
  title: string;
  price: number;
  quantity: number;
  description: string;
  category: Category;
  image: string;
  rating: { rate: number; count: number };
}
