import { ReqBodyBlog } from "../../src/modules/blogs/blog";

export const auth = { Authorization: "Basic YWRtaW46cXdlcnR5" };

export const incorrectQuery = {
  empty: "&pageNumber=&pageSize=&sortBy=&sortDirection=",
  incorrect:
    "&pageNumber=qwerty&pageSize=text&sortBy[test]=ip&sortDirection[]=ask",
} as const;

export const validBlogs: ReqBodyBlog[] = [
  { name: "Blog 1", youtubeUrl: "https://youtube.com" },
  { name: "Second", youtubeUrl: "https://youtube.com" },
  { name: "Blog3", youtubeUrl: "https://1youtube.com" },
  { name: "abc blog", youtubeUrl: "https://2youtube.com" },
  { name: "valid", youtubeUrl: "https://3youtube.com" },
];
