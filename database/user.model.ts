import { model, models, Schema } from "mongoose";

export interface IUser {
  id: string;
  name: string;
  username: string;
  email: string;
  bio?: string;
  image: string;
  location?: string;
  portofolio?: string;
  reputation?: number;
}

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String },
    image: { type: String },
    location: { type: String },
    portofolio: { type: String },
    reputation: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;
