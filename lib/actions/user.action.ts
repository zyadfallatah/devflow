"use server";

import {
  ActionResponse,
  Answer as AnswerType,
  BadgeCounts,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
  Tag as TagType,
  User as UserType,
} from "@/types/global";
import action from "../handlers/action";
import {
  DeleteUserPostSchema,
  GetUserAnswersSchema,
  GetUserQuestionsSchema,
  GetUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
  UpdateUserSchema,
} from "../validation";
import handleError from "../handlers/error";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import {
  Answer,
  Collection,
  Interaction,
  Question,
  Tag,
  TagQuestion,
  User,
} from "@/database";
import {
  DeleteUserPostParams,
  GetUploadAuthParams,
  GetUserAnswersParams,
  GetUserParams,
  GetUserQuestionsParams,
  GetUserTagsParams,
  UpdateUserParams,
} from "@/types/action";
import { auth } from "@/auth";
import { NotFoundError, UnauthorizedError } from "../http-errors";
import ROUTES from "@/constants/routes";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import Vote from "@/database/vote.model";
import { assignBadges } from "../utils";
import { getUploadAuthParams } from "@imagekit/next/server";

export async function getUsers(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ users: UserType[]; isNext: boolean }>> {
  const validationParams = await action({
    params,
    schema: PaginatedSearchParamsSchema,
  });
  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }
  const {
    page = 1,
    pageSize = 10,
    query,
    filter,
    sort,
  } = validationParams.params;

  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<UserType> = {};

  if (query) {
    filterQuery.$or = [
      { name: { $regex: query, $options: "i" } },
      { username: { $regex: query, $options: "i" } },
      { email: { $regex: query, $options: "i" } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: 1 };
      break;
    case "popular":
      sortCriteria = { reputation: -1 };
      break;
    default:
      sortCriteria = { reputation: -1 };
      break;
  }

  try {
    const totalUsers = await User.countDocuments(filterQuery);
    const users = await User.find(filterQuery)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalUsers > skip + users.length;

    return {
      success: true,
      data: { users: JSON.parse(JSON.stringify(users)), isNext },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUser(params: GetUserParams): Promise<
  ActionResponse<{
    user: UserType;
    totalQuestions: number;
    totalAnswers: number;
  }>
> {
  const validationParams = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId } = validationParams.params;

  try {
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");

    const totalQuestions = await Question.countDocuments({ author: userId });
    const totalAnswers = await Answer.countDocuments({ author: userId });

    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
        totalQuestions,
        totalAnswers,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserQuestions(params: GetUserQuestionsParams): Promise<
  ActionResponse<{
    questions: QuestionType[];
    isNext: boolean;
  }>
> {
  const validationParams = await action({
    params,
    schema: GetUserQuestionsSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationParams.params;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  try {
    const totalQuestions = await Question.countDocuments({ author: userId });
    const questions = await Question.find({ author: userId })
      .populate("tags", "name")
      .populate("author", "name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;
    return {
      success: true,
      data: {
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserAnswers(params: GetUserAnswersParams): Promise<
  ActionResponse<{
    answers: AnswerType[];
    isNext: boolean;
  }>
> {
  const validationParams = await action({
    params,
    schema: GetUserAnswersSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId, page = 1, pageSize = 10 } = validationParams.params;
  const skip = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  try {
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const answers = await Answer.find({ author: userId })
      .populate("author", "_id name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const isNext = totalAnswers > skip + answers.length;
    return {
      success: true,
      data: {
        answers: JSON.parse(JSON.stringify(answers)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserTopTags(params: GetUserTagsParams): Promise<
  ActionResponse<{
    tags: { _id: string; name: string; count: number }[];
  }>
> {
  const validationParams = await action({
    params,
    schema: GetUserTagsSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId } = validationParams.params;

  try {
    const pipeline: PipelineStage[] = [
      { $match: { author: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "tags",
          localField: "_id",
          foreignField: "_id",
          as: "tagInfo",
        },
      },
      { $unwind: "$tagInfo" },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: "$tagInfo._id", name: "$tagInfo.name", count: 1 } },
    ];

    const tags = await Question.aggregate(pipeline);

    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteUserPost(
  params: DeleteUserPostParams
): Promise<ActionResponse> {
  const validationParams = await action({
    params,
    schema: DeleteUserPostSchema,
    authorize: true,
  });
  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { type, targetId } = validationParams.params;
  const session = await auth();
  const dbSession = await mongoose.startSession();
  const userId = session?.user?.id!;

  const Model = type === "question" ? Question : Answer;

  dbSession.startTransaction();
  try {
    const post = await Model.findOne({ _id: targetId });
    if (!post) throw new NotFoundError(`${type}`);

    if (post.author._id.toString() !== userId)
      throw new UnauthorizedError("user");

    await Model.deleteOne({ _id: targetId }).session(dbSession);

    if (type === "answer") {
      await Question.updateOne(
        { _id: post.question },
        { $inc: { answers: -1 } }
      ).session(dbSession);
      await Vote.deleteMany({
        actionId: targetId,
        actionType: "answer",
      }).session(dbSession);
    } else {
      await Collection.deleteMany({ question: targetId }).session(dbSession);
      await TagQuestion.deleteMany({ question: targetId }).session(dbSession);
      await Answer.deleteMany({ question: targetId }).session(dbSession);
      await Tag.updateMany(
        { _id: { $in: post.tags } },
        { $inc: { questions: -1 } },
        { session: dbSession }
      );
      await Vote.deleteMany({
        actionId: targetId,
        actionType: "question",
      }).session(dbSession);
    }

    await dbSession.commitTransaction();
    revalidatePath(ROUTES.PROFILE(userId));
    return {
      success: true,
    };
  } catch (error) {
    dbSession.abortTransaction;
    return handleError(error) as ErrorResponse;
  } finally {
    dbSession.endSession();
  }
}

export async function getUserStats(params: GetUserParams): Promise<
  ActionResponse<{
    totalQuestions: number;
    totalAnswers: number;
    badges: BadgeCounts;
  }>
> {
  const validationParams = await action({
    params,
    schema: GetUserSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId } = validationParams.params;

  try {
    const [questionStats] = await Question.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const [answerStats] = await Answer.aggregate([
      { $match: { author: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          upvotes: { $sum: "$upvotes" },
          views: { $sum: "$views" },
        },
      },
    ]);

    const badges = assignBadges({
      criteria: [
        { type: "ANSWER_COUNT", count: answerStats.count },
        { type: "QUESTION_COUNT", count: questionStats.count },
        { type: "QUESTION_UPVOTES", count: questionStats.upvotes },
        { type: "ANSWER_UPVOTES", count: answerStats.upvotes },
        { type: "TOTAL_VIEWS", count: questionStats.views + answerStats.views },
      ],
    });

    return {
      success: true,
      data: {
        totalQuestions: questionStats.count,
        totalAnswers: answerStats.count,
        badges,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateUser(
  params: UpdateUserParams
): Promise<ActionResponse<{ user: UserType }>> {
  const validationParams = await action({
    params,
    schema: UpdateUserSchema,
    authorize: true,
  });
  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { userId, bio, image, location, portofolio } = validationParams.params;
  const currentUserId = validationParams.session?.user?.id;

  try {
    if (userId !== currentUserId) {
      throw new UnauthorizedError("user");
    }
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError("User");

    if (bio) user.bio = bio;
    if (image) user.image = image;
    if (location) user.location = location;
    if (portofolio) user.portofolio = portofolio;

    await user.save();
    return {
      success: true,
      data: {
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserUploadImageAuth(): Promise<
  ActionResponse<GetUploadAuthParams>
> {
  const session = await auth();
  const userId = session?.user?.id;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY!;
  try {
    if (!userId) throw new NotFoundError("User");
    const { token, signature, expire } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey,
    });
    return {
      success: true,
      data: {
        token,
        signature,
        expire,
        publicKey,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
