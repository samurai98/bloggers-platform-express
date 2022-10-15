import { blogsCollection } from "../../../common/db";
import {
  getPagesCount,
  getSkipCount,
  getSortDirectionNumber,
} from "../../../common/helpers/pagination";
import { Blog, QueryBlog, ResponseBlogs } from "../blog";

export const blogsQueryRepository = {
  async getBlogs(query: QueryBlog = {}): Promise<ResponseBlogs> {
    const pageNumber = Number(query.pageNumber) || 1;
    const pageSize = Number(query.pageSize) || 10;
    const searchNameTerm = query.searchNameTerm || "";
    const sortBy = query.sortBy || "createdAt";
    const sortDirection = getSortDirectionNumber(query.sortDirection || "desc");

    const totalCount = await blogsCollection.countDocuments();

    const skipCount = getSkipCount(pageNumber, pageSize);
    const pagesCount = getPagesCount(totalCount, pageSize);

    const items = (await blogsCollection
      .find(
        { name: { $regex: new RegExp(`${searchNameTerm}`, 'i') } },
        { projection: { _id: false } }
      )
      .sort({ [sortBy]: sortDirection })
      .skip(skipCount)
      .limit(pageSize)
      .toArray()) as Blog[];

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  },

  async findBlogById(id: string): Promise<Blog | null> {
    return blogsCollection.findOne({ id }, { projection: { _id: false } });
  },
};
