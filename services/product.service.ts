import api from "@/lib/axios";
import {
  CreateProductPayload,
  Product,
  ProductsResponse,
  UpdateProductPayload,
} from "@/types/product";

export const productService = {
  async getProducts(
    limit = 10,
    skip = 0,
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>("/products", {
      params: {
        limit,
        skip,
      },
      signal,
    });

    return response.data;
  },

  async getProductById(
    id: number,
    signal?: AbortSignal
  ): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`, {
      signal,
    });

    return response.data;
  },

  async searchProducts(
    query: string,
    limit = 10,
    skip = 0,
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>(
      "/products/search",
      {
        params: {
          q: query,
          limit,
          skip,
        },
        signal,
      }
    );

    return response.data;
  },

  async getCategories(
    signal?: AbortSignal
  ): Promise<string[]> {
    const response = await api.get<string[]>(
      "/products/category-list",
      {
        signal,
      }
    );

    return response.data;
  },

  async getProductsByCategory(
    category: string,
    limit = 10,
    skip = 0,
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const response = await api.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      {
        params: {
          limit,
          skip,
        },
        signal,
      }
    );

    return response.data;
  },

  async createProduct(
    product: CreateProductPayload
  ): Promise<Product> {
    const response = await api.post<Product>(
      "/products/add",
      product
    );

    return response.data;
  },

  async updateProduct(
    id: number,
    product: UpdateProductPayload
  ): Promise<Product> {
    const response = await api.put<Product>(
      `/products/${id}`,
      product
    );

    return response.data;
  },

  async deleteProduct(id: number): Promise<Product> {
    const response = await api.delete<Product>(
      `/products/${id}`
    );

    return response.data;
  },
};