export type SkinType = 'dry' | 'oily' | 'combination' | 'acne';
export type ProductCategory = 'makeup' | 'skincare' | 'haircare' | 'bath&body';

export interface ProductColor {
  name: string;
  hex: string;
  stock: number;
}

export interface Product {
  _id: string;
  name: string;
  category: ProductCategory;
  brandId: string;
  price: number;
  images: [string];
  description: string;
  skinTypes?: SkinType[];
  ingredients?: string[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isHotSale?: boolean;
  discount?: number;
  stock?: number;
  colors:ProductColor[];
  litres:{
    amount:string;
    stock:number;
  }[];
  createdAt:string;
  updatedAt:string;
  
}

export interface CartItem {
  product: Product;
  quantity: number;
  stock:number;
  selectedColor:string;
  price:number;
  selectedLitre:string;
}
