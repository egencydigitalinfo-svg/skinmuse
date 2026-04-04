import { ProductCategory } from './product';

export interface ParentCategory {
  _id: string;
  title: string;
}

export interface Cat {
  _id: string;
  title: string;
  category: ProductCategory;
  image?: string;
  status?: boolean;
  parent_id?: ParentCategory | string | null;
}