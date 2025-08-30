import { CollectionTransformer } from "@/base/base.transformer";
import { IPost, Post } from "../entities/post.entity";
import { postResource } from "./post.resource";

class PostCollection implements CollectionTransformer {
  transformCollection(requestedData: Post[]): IPost[] {
    return requestedData.map((rd) => postResource.transform(rd));
  }
}

export const postCollection = new PostCollection();
