import { model } from "mongoose";
import PostSchema from "../schemas/post.schema";

const PostModel = model("post", PostSchema);

export default PostModel;
