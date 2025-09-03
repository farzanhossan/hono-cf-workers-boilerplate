import { BaseEntity } from "@/base/base.entity";
import { IUser } from "@/modules/users/entities/user.entity";

export interface Post extends BaseEntity {
  data: {
    is_help_post?: boolean;
    galleries?: [
      {
        type?: "video" | "image";
        link?: string;
        key?: string;
      }
    ];
    description?: string;
    user_id?: string;
  };
}

export interface IPost {
  id?: string;
  data: {
    isHelpPost?: boolean;
    galleries?: [
      {
        type?: "video" | "image";
        link?: string;
        key?: string;
      }
    ];
    description?: string;
    userId?: string;
  };
  user?: IUser;
  createdAt?: Date;
  updatedAt?: Date;
}
