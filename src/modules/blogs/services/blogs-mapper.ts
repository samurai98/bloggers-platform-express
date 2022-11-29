import { Blog, BlogDB } from '../blog';

export const blogMapper = (blogDB: BlogDB): Blog => {
  const { id, name, websiteUrl, description, createdAt } = blogDB;

  return { id, name, websiteUrl, description, createdAt };
};
