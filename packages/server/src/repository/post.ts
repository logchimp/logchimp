import { v4 as uuidv4 } from "uuid";
import database from "../database";

interface CreatePostWithVoteOptions {
  userId: string;
  title: string;
  slug: string;
  slugId: string;
  contentMarkdown: string | null;
}

/**
 * Insert a post along with its author's first vote, same as the
 * `POST /api/v1/posts` endpoint does.
 */
export async function createPostWithVote({
  userId,
  title,
  slug,
  slugId,
  contentMarkdown,
}: CreatePostWithVoteOptions) {
  return database.transaction(async (trx) => {
    const [post] = await trx
      .insert({
        postId: uuidv4(),
        title,
        slug,
        slugId,
        contentMarkdown,
        userId,
      })
      .into("posts")
      .returning(["postId", "title", "slug"]);

    await trx
      .insert({
        voteId: uuidv4(),
        userId,
        postId: post.postId,
      })
      .into("votes");

    return post as { postId: string; title: string; slug: string };
  });
}
