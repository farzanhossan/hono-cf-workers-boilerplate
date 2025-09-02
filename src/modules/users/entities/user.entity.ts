import { BaseEntity } from "@/base/base.entity";

export interface User extends BaseEntity {
  data: {
    name: string;
    email: string;
    avatar?: string;
    password?: string;
  };
}

export interface IUser {
  id?: string;
  data: {
    name?: string;
    email?: string;
    avatar?: string;
    password?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
