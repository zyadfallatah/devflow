import { model, models, Schema, Types } from "mongoose";

interface IQuestion {
  author: Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  upvotes?: number;
  downvotes?: number;
  answers?: number[];
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const QuestionSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag", required: true }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    answers: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const User = models?.user || model<IQuestion>("Question", QuestionSchema);

export default User;
