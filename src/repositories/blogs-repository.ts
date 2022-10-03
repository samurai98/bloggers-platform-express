type Blog = {
  id: string;
  name: string;
  youtubeUrl: string;
};

const blogs: Blog[] = [];

export const blogsRepository = {
  getAllBlogs() {
    return blogs;
  },

  findBlogById(id: string) {
    return blogs.find((blog) => blog.id === id);
  },

  createBlog({ name, youtubeUrl }: Blog) {
    const newBlog: Blog = { id: new Date().toISOString(), name, youtubeUrl };
    blogs.push(newBlog);

    return newBlog;
  },

  updateBlog(id: string, blog: Blog) {
    const currentBlog = this.findBlogById(id);

    if (!currentBlog) return false;

    Object.assign(currentBlog, blog);
    return true;
  },

  deleteBlog(id: string) {
    const index = blogs.findIndex((blog) => blog.id === id);

    if (index === -1) return false;

    blogs.splice(index, 1);
    return true;
  },
};
