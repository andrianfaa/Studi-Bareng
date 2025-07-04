import { model } from "mongoose";
import UserSchema from "../schemas/user.schema";

const UserModel = model("user", UserSchema);

export default UserModel;
