import { Category } from './category';

export interface Post {
  title: string;
  permalink: string;
  excerpt: string;
  category: Category;
  postImgUrl: string;
  content: string;
  isFeatured: boolean;
  views: number;
  status: string;
  createdAt: Date;
  id?: string;
}
