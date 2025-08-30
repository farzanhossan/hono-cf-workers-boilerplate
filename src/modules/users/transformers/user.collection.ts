import { CollectionTransformer } from "@/base/base.transformer";
import { IUser, User } from "../entities/user.entity";
import { userResource } from "./user.resource";

class UserCollection implements CollectionTransformer {
  transformCollection(requestedData: User[]): IUser[] {
    return requestedData.map((rd) => userResource.transform(rd));
  }
}

export const userCollection = new UserCollection();
