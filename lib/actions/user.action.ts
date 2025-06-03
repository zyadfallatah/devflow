"use server";

import {
  ActionResponse,
  Answer as AnswerType,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
  Tag as TagType,
  User as UserType,
} from "@/types/global";
import action from "../handlers/action";
import {
  GetUserAnswersSchema,
  GetUserQuestionsSchema,
  GetUserSchema,
  GetUserTagsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { Answer, Question, User } from "@/database";
import {
  GetUserAnswersParams,
  GetUserParams,
  GetUserQuestionsParams,
  GetUserTagsParams,
} from "@/types/action";

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
