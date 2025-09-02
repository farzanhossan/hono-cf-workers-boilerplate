import { Transformer } from "src/base/base.transformer";
import { IUser, User } from "../entities/user.entity";

class UserResource implements Transformer {
  transform(entity: User): IUser {
    return {
      id: entity.id,
      data: {
        name: entity.data?.name,
        email: entity.data?.email,
        avatar: entity.data?.avatar,
        password: entity.data?.password,
      },
      createdAt: entity.created_at,
      updatedAt: entity?.updated_at,
    };
  }
}

export const userResource = new UserResource();
