import { Transformer } from "src/base/base.transformer";
import { IPost, Post } from "../entities/post.entity";

class PostResource implements Transformer {
  transform(entity: Post): IPost {
    return {
      id: entity.id,
      data: {
        isHelpPost: entity.data.is_help_post,
        galleries: entity.data.galleries,
        description: entity.data.description,
        userId: entity.data.user_id,
      },
      createdAt: entity.created_at,
      updatedAt: entity?.updated_at,
    };
  }
}

export const postResource = new PostResource();
