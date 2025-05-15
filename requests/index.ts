import { CategoriesResponse, ProductDetailResponse, ProductsResponse } from "../types";

export const endpoints = {
  allCategories: "products/categories",
  category: "products/category/${name}",
  products: "products",
  product: (id: string) => `products/${id}`,
};

export const fetchCategories = async (): Promise<CategoriesResponse> => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.allCategories}`).then((r) =>
    r.json()
  );
  return data;
};

export const fetchCategory = async (id: string) => {
  const data = await fetch(`https://fakestoreapi.com/${endpoints.category}`);
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
