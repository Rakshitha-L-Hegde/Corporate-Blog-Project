import { PostStatus } from "@prisma/client";

export const publishedFilter = {
  status: PostStatus.PUBLISHED,
  publishedAt: {
    not: null
  }
};