export interface Blog {
  _id?: string;              // optional for new blogs
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;              // ISO date string (e.g., "2025-10-21")
  category: string;
  image?: string;            // full image URL
  views?: number;            // optional (for "popular" sorting)
  createdAt?: string;
  updatedAt?: string;
}
