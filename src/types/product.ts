export type SkinType = 'dry' | 'oily' | 'combination' | 'acne';
export type ProductCategory = 'makeup' | 'skincare' | 'haircare' | 'bath&body';

export interface ProductColor {
  name: string;
  hex: string;
  stock: number;
}

// types/product.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  description: string;
  category: { _id: string; title: string } | null;
  subcategory: { _id: string; title: string } | null;
  productType: string;
  images: string[];
  brandId: string | null;
  brand: { _id: string; name: string; logo?: string; discount?: number } | null;
  brandName: string | null;
  stock: number;
  salesCount: number;
  skinType: string[];
  ingredients: string[];
  litres: { amount: number; stock: number; price?: number }[];
  colors: { name: string; hex: string; stock: number; price?: number }[];
  isTrending: boolean;
  isHotSale: boolean;
  isFeatured: boolean;
  reviews: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  stock:number;
  selectedColor:string;
  price:number;
  selectedLitre:string;
}
