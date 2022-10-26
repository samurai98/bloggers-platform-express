import { ReqBodyBlog } from "../../src/modules/blogs/blog";
import { ReqBodyPost } from "../../src/modules/posts/post";
import { ReqBodyUser } from "../../src/modules/users/user";

export const basicAuth = { Authorization: "Basic YWRtaW46cXdlcnR5" };

export const bearerAuth = {} as { Authorization: string };

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

export const validPosts: Partial<ReqBodyPost>[] = [
  {
    title: "first post",
    content: "some content",
    shortDescription: "description",
  },
  {
    title: "abc title",
    content: "content qwerty",
    shortDescription: "short about",
  },
  {
    title: "title ABc",
    content: "1 some content",
    shortDescription: "2description",
  },
  {
    title: "12345",
    content: "2 content",
    shortDescription: "2description",
  },
  {
    title: "0title",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    shortDescription: "ipsum dolor sit",
  },
];

export const validUsers: ReqBodyUser[] = [
  { email: "valid@gmail.com", login: "nickname", password: "validPass" },
  { email: "pochta@mail.ru", login: "ame NIck", password: "secret" },
  { email: "1mail@poc.COm", login: "my login", password: "superSecret" },
  { email: "2mail@st.by", login: "Mikola_-", password: "13password13" },
  { email: "valid2@gmail.ua", login: "lostCherry", password: "567213jd" },
];
