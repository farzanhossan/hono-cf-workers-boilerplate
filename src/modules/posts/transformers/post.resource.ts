import { Transformer } from "src/base/base.transformer";
import { IPost, Post } from "../entities/post.entity";
import { User } from "@/modules/users/entities/user.entity";

class PostResource implements Transformer {
  transform(entity: Partial<Post & { user: User }>): IPost {
    return {
      id: entity.id,
      data: {
        isHelpPost: entity?.data?.is_help_post,
        galleries: (entity?.data?.galleries as any) || [],
        description: entity?.data?.description,
        userId: entity?.data?.user_id,
      },
      user: entity.user,
      createdAt: entity.created_at,
      updatedAt: entity?.updated_at,
    };
  }
}

export const postResource = new PostResource();
