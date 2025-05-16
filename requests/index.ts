import { CategoriesResponse, ProductDetailResponse, ProductsResponse } from "../types/types";

export const endpoints = {
  allCategories: "products/categories",
  category: (name: string) => `products/category/${name}`,
  products: "products",
  product: (id: string) => `products/${id}`,
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.allCategories}`).then((r) =>
    r.json()
  );
  return data;
};

export const fetchCategory = async (name: string) => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.category(name)}`).then((r) =>
    r.json()
  );
  return data;
};

export const fetchProducts = async (): Promise<ProductsResponse> => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.products}`).then((r) => r.json());
  return data;
};

export const fetchProduct = async (id: string): Promise<ProductDetailResponse> => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.product(id)}`).then((r) => r.json());
  return data;
};
