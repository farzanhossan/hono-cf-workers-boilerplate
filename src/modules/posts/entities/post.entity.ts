import { BaseEntity } from "@/types";

export interface Post extends BaseEntity {
  data: {
    is_help_post?: boolean;
    galleries?: {
      type: "video" | "image";
      link: string;
      key: string;
    };
    description?: string;
    user_id?: string;
  };
}
