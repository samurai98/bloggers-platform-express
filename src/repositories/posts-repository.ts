type Post = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
};

const posts: Post[] = [];

export const postsRepository = {
  getAllPosts() {
    return posts;
  },

  findPostById(id: string) {
    return posts.find((post) => post.id === id);
  },

  createPost({ title, shortDescription, content, blogId, blogName }: Post) {
    const newPost: Post = {
      id: new Date().toISOString(),
      title,
      shortDescription,
      content,
      blogId,
      blogName: blogName || 'no blog name'
    };
    posts.push(newPost);

    return newPost;
  },

  updatePost(id: string, post: Post) {
    const currentPost = this.findPostById(id);

    if (!currentPost) return false;

    Object.assign(currentPost, post);
    return true;
  },

  deletePost(id: string) {
    const index = posts.findIndex((post) => post.id === id);

    if (index === -1) return false;

    posts.splice(index, 1);
    return true;
  },
};
