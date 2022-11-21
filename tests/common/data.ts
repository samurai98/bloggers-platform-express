import { ReqBodyBlog } from "../../src/modules/blogs/blog";
import { ReqBodyComment } from "../../src/modules/comments/comment";
import { ReqBodyPost } from "../../src/modules/posts/post";
import { ReqBodyUser } from "../../src/modules/users/user";

export const basicAuth = { Authorization: "Basic YWRtaW46cXdlcnR5" };

export const bearerAuth = {} as { Authorization: string; Cookie: string };

export const incorrectQuery = {
  empty: "&pageNumber=&pageSize=&sortBy=&sortDirection=",
  incorrect:
    "&pageNumber=qwerty&pageSize=text&sortBy[test]=ip&sortDirection[]=ask",
} as const;

export const validBlogs: ReqBodyBlog[] = [
  {
    name: "Blog 1",
    websiteUrl: "https://youtube.com",
    description: "Lorem Ipsum",
  },
  {
    name: "Second",
    websiteUrl: "https://youtube.com",
    description: "Lorem Ipsum is simply dummy text of the printing",
  },
  {
    name: "Blog3",
    websiteUrl: "https://1youtube.com",
    description: "Lorem Ipsum is simply dummy text of the printing",
  },
  {
    name: "abc blog",
    websiteUrl: "https://2youtube.com",
    description: "Lorem Ipsum is simply dummy text of the printing",
  },
  {
    name: "valid",
    websiteUrl: "https://3youtube.com",
    description: "Lorem Ipsum is simply dummy text of the printing",
  },
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

export const validComments: Partial<ReqBodyComment>[] = [
  { content: "Lorem ipsum dolor sit amet, consectetur adipiscing" },
  { content: "2 Lorem ipsum dolor sit amet, consectetur adipiscing" },
  {
    content:
      "consectetur adipiscing ipsum dolor sit amet, Lorem ipsum dolor sit amet, Lorem ipsum dolor sit amet,  Lorem ipsum dolor sit amet,  Lorem ipsum dolor sit amet,  Lorem ipsum dolor sit amet,  Lorem ipsum dolor sit amet,  Lorem ipsum dolor sit amet",
  },
  { content: "2 consectetur adipiscing ipsum dolor sit amet" },
  { content: "3 consectetur adipiscing ipsum dolor sit amet" },
];

export const validUsers: ReqBodyUser[] = [
  { email: "valid@gmail.com", login: "nickname", password: "validPass" },
  { email: "pochta@mail.ru", login: "ame NIck", password: "secret" },
  { email: "1mail@poc.COm", login: "my login", password: "superSecret" },
  { email: "2mail@st.by", login: "Mikola_-", password: "13password13" },
  { email: "valid2@gmail.ua", login: "lostCherry", password: "567213jd" },
];
