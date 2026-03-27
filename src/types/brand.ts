import { ProductCategory } from './product';

export interface Brand {
  _id: string;
  name: string;
  category: ProductCategory;
  description: string;
  logo?: string;
  discount?: number;
}
