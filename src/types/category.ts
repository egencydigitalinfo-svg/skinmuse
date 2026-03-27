import { ProductCategory } from './product';

export interface Cat {
  _id: string;
  title: string;
  category: ProductCategory;
  image?: string;
}
