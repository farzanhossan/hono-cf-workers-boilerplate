import { BaseEntity } from "@/types";

export interface User extends BaseEntity {
  data: {
    name: string;
    email: string;
    avatar?: string;
  };
}
