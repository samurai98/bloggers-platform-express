export type Product = { id: number; title: string };

export type Blog = {
  id: string;
  name: string;
  youtubeUrl: string;
  createdAt: string;
};

export type Post = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};
