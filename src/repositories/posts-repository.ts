type Post = any;

const posts: Post[] = [];

export const postsRepository = {
  findPosts(title?: string) {
    if (!title) return posts;

    return posts.filter((post) => post.title.indexOf(title) > -1);
  },

  findPostById(id: number) {
    return posts.find((post) => post.id === id);
  },

  createPost(title: string) {
    const newPost = { id: Number(new Date()), title };
    posts.push(newPost);
    return newPost;
  },

  updatePost(id: number, title: string) {
    const post = this.findPostById(id);

    if (!post) return false;

    post.title = title;
    return true;
  },

  deletePost(id: number) {
    const index = posts.findIndex((post: Post) => post.id === id);

    if (index === -1) return false;

    posts.splice(index, 1);
    return true;
  },
};
