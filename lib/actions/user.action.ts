"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  User as UserType,
} from "@/types/global";
import action from "../handlers/action";
import { GetUserSchema, PaginatedSearchParamsSchema } from "../validation";
import handleError from "../handlers/error";
import { FilterQuery } from "mongoose";
import { Answer, Question, User } from "@/database";
import { GetUserParams } from "@/types/action";

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
