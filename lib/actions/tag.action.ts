"use server";
import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
} from "@/types/global";
import action from "../handlers/action";
import {
  GetTagQuestionsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import handleError from "../handlers/error";
import Tag, { ITag } from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import { Question } from "@/database";
import { GetTagQuestionsParams } from "@/types/action";

export async function getTags(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ tags: ITag[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const {
    page = 1,
    pageSize = 10,
    query,
    filter,
    sort,
  } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<ITag> = {};

  if (filter === "recommended") {
    return { success: true, data: { tags: [], isNext: false } };
  }

  if (query) {
    filterQuery.$or = [{ name: { $regex: new RegExp(query, "i") } }];
  }

  let sortCriteria = {};
  switch (filter) {
    case "popular":
      sortCriteria = { questions: -1 };
      break;
    case "recent":
      sortCriteria = { createdAt: -1 };
      break;
    case "oldest":
      sortCriteria = { createdAt: -1 };
      break;
    case "name":
      sortCriteria = { name: 1 };
      break;
    default:
      sortCriteria = { questions: -1 };
      break;
  }

  try {
    const totalTags = await Tag.countDocuments(filterQuery);
    const tags = await Tag.find(filterQuery)
      .lean()
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const isNext = totalTags > skip + tags.length;
    return {
      success: true,
      data: {
        tags: JSON.parse(JSON.stringify(tags)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getTagQuestions(
  params: GetTagQuestionsParams
): Promise<
  ActionResponse<{ tag: ITag; questions: QuestionType[]; isNext: boolean }>
> {
  const validationResult = await action({
    params,
    schema: GetTagQuestionsSchema,
    authorize: false,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, tagId } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  try {
    const tag = await Tag.findById(tagId);
    if (!tag) throw new Error("Tag not found");

    const filterQuery: FilterQuery<QuestionType> = {
      tags: { $in: [tagId] },
    };

    if (query) {
      filterQuery.title = { $regex: new RegExp(query, "i") };
    }
    const totalQuestions = await Question.countDocuments(filterQuery);
    const questions = await Question.find(filterQuery)
      .select("_id title author upvotes downvotes answers views createdAt")
      .populate("author", "name image")
      .populate("tags", "name")
      .skip(skip)
      .limit(limit);

    const isNext = totalQuestions > skip + questions.length;
    return {
      success: true,
      data: {
        tag: JSON.parse(JSON.stringify(tag)),
        questions: JSON.parse(JSON.stringify(questions)),
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
