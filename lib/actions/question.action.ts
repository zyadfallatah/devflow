"use server";

import {
  ActionResponse,
  ErrorResponse,
  PaginatedSearchParams,
  Question as QuestionType,
} from "@/types/global";
import {
  AskQuestionSchema,
  EditQuestionSchema,
  GetQuestionSchema,
  IncrementViewsSchema,
  PaginatedSearchParamsSchema,
} from "../validation";
import action from "../handlers/action";
import handleError from "../handlers/error";
import mongoose, { FilterQuery, Types } from "mongoose";
import Question from "@/database/question.model";
import Tag, { ITag } from "@/database/tag.model";
import TagQuestion from "@/database/tag-question.model";
import { UnauthorizedError } from "../http-errors";
import logger from "../logger";
import {
  CreateQuestionParams,
  EditQuestionParams,
  GetQuestionParams,
  IncrementViewsParams,
  RecommendationParams,
} from "@/types/action";
import { createInteraction } from "./interaction.action";
import { after } from "next/server";
import { Interaction } from "@/database";
import { auth } from "@/auth";
import { cache } from "react";

export async function createQuestion(
  params: CreateQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: AskQuestionSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags } = validationResult.params!;
  const userId = validationResult.session?.user!.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [question] = await Question.create(
      [{ title, content, author: userId }],
      {
        session,
      }
    );

    if (!question) throw new Error("Failed to create question");

    const tagIds: mongoose.Types.ObjectId[] = [];
    const tagQuestionDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
        { upsert: true, new: true, session }
      ).session(session);

      tagIds.push(existingTag._id);
      tagQuestionDocuments.push({
        tag: existingTag._id,
        question: question._id,
      });
    }
    await TagQuestion.insertMany(tagQuestionDocuments, { session });
    await Question.findByIdAndUpdate(
      question._id,
      { $push: { tags: { $each: tagIds } } },
      { session }
    );

    after(async () => {
      await createInteraction({
        action: "post",
        actionId: question._id.toString(),
        actionTarget: "question",
        authorId: userId!,
      });
    });

    await session.commitTransaction();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function editQuestion(
  params: EditQuestionParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: EditQuestionSchema,
    authorize: true,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { title, content, tags, questionId } = validationResult.params!;
  const userId = validationResult.session?.user!.id;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const question = await Question.findById(questionId).populate("tags");

    if (!question) throw new Error("Question not found");

    if (question.author.toString() !== userId)
      throw new UnauthorizedError("Edit");

    if (question.title !== title || question.content !== content) {
      question.title = title;
      question.content = content;
      await question.save({ session });
    }

    const tagsToAdd = tags.filter(
      (tag) =>
        !question.tags.some((t: ITag) =>
          t.name.toLowerCase().includes(tag.toLowerCase())
        )
    );
    const tagsToRemove = question.tags.filter(
      (tag: ITag) =>
        !tags.some((t) => t.toLowerCase() === tag.name.toLowerCase())
    );

    const newTagDocuments = [];

    if (tagsToAdd.length > 0) {
      for (const tag of tagsToAdd) {
        const existingTag = await Tag.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${tag}$`, "i") } },
          { $setOnInsert: { name: tag }, $inc: { questions: 1 } },
          { upsert: true, new: true, session }
        ).session(session);

        if (existingTag) {
          newTagDocuments.push({
            tag: existingTag._id,
            question: question._id,
          });
          question.tags.push(existingTag._id);
        }
      }
    }

    if (tagsToRemove.length > 0) {
      const tagIdsToRemove = tagsToRemove.map((tag: ITag) => tag._id);

      await Tag.updateMany(
        { _id: { $in: tagIdsToRemove } },
        { $inc: { questions: -1 } },
        { session }
      );

      await TagQuestion.deleteMany(
        { tag: { $in: tagIdsToRemove }, question: question._id },
        { session }
      );
      question.tags = question.tags.filter(
        (tag: mongoose.Types.ObjectId) =>
          !tagIdsToRemove.some((id: mongoose.Types.ObjectId) =>
            id.equals(tag._id)
          )
      );
    }
    if (newTagDocuments.length > 0) {
      await TagQuestion.insertMany(newTagDocuments, { session });
    }
    await question.save({ session });
    await session.commitTransaction();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export const getQuestion = cache(
  // Don't Call this function in client component
  async function getQuestion(
    params: GetQuestionParams
  ): Promise<ActionResponse<QuestionType>> {
    const validationResult = await action({
      params,
      schema: GetQuestionSchema,
    });
    if (validationResult instanceof Error) {
      return handleError(validationResult) as ErrorResponse;
    }

    const { questionId } = validationResult.params!;

    try {
      const question = await Question.findById(questionId)
        .populate("tags")
        .populate("author", "_id name image");

      if (!question) throw new Error("Question not found");

      return {
        success: true,
        data: JSON.parse(JSON.stringify(question)),
      };
    } catch (error) {
      return handleError(error) as ErrorResponse;
    }
  }
);
export async function getRecommendedQuestions(params: RecommendationParams) {
  const { userId, query, skip, limit } = params;
  const interaction = await Interaction.find({
    user: new Types.ObjectId(userId),
    actionType: "question",
    action: { $in: ["upvote", "view", "bookmark", "post"] },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const questionIds = interaction.map((i) => i.actionId);
  const interactedQuestions = await Question.find({
    _id: { $in: questionIds },
  }).select("tags");

  const allTags = interactedQuestions.flatMap((q) =>
    q.tags.map((tag: Types.ObjectId) => tag.toString())
  );

  const uniqueTags = [...new Set(allTags)];

  const recommendedQuery: FilterQuery<QuestionType> = {
    _id: { $nin: questionIds },
    author: { $ne: new Types.ObjectId(userId) },
    tags: { $in: uniqueTags.map((tag) => new Types.ObjectId(tag)) },
  };

  if (query) {
    recommendedQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }
  const total = await Question.countDocuments(recommendedQuery);
  const questions = await Question.find(recommendedQuery)
    .populate("tags", "name")
    .populate("author", "name image")
    .sort({ upvotes: -1, views: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    questions: JSON.parse(JSON.stringify(questions)),
    isNext: total > skip + questions.length,
  };
}

export async function getQuestions(
  params: PaginatedSearchParams
): Promise<ActionResponse<{ questions: QuestionType[]; isNext: boolean }>> {
  const validationResult = await action({
    params,
    schema: PaginatedSearchParamsSchema,
    authorize: false,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const { page = 1, pageSize = 10, query, filter } = validationResult.params!;
  const skip = (Number(page) - 1) * pageSize;
  const limit = Number(pageSize);

  const filterQuery: FilterQuery<QuestionType> = {};

  if (filter === "recommended") {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId)
      return { success: true, data: { questions: [], isNext: false } };

    const recommended = await getRecommendedQuestions({
      userId,
      query,
      skip,
      limit,
    });
    return {
      success: true,
      data: recommended,
    };
  }

  if (query) {
    filterQuery.$or = [
      { title: { $regex: new RegExp(query, "i") } },
      { content: { $regex: new RegExp(query, "i") } },
    ];
  }

  let sortCriteria = {};

  switch (filter) {
    case "newest":
      sortCriteria = { createdAt: -1 };
      break;
    case "unanswered":
      filterQuery.answers = 0;
      sortCriteria = { createdAt: -1 };
      break;
    case "popular":
      sortCriteria = { upvotes: -1, views: -1 };
      break;
    default:
      sortCriteria = { createdAt: -1 };
      break;
  }

  try {
    const totalQuestions = await Question.countDocuments(filterQuery);
    const questions = await Question.find(filterQuery)
      .populate("tags", "name")
      .populate("author", "name image")
      .lean()
      .sort(sortCriteria)
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

export async function incrementViews(
  params: IncrementViewsParams
): Promise<ActionResponse<QuestionType>> {
  const validationResult = await action({
    params,
    schema: IncrementViewsSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params;

  try {
    const question = await Question.findById(questionId);

    if (!question) throw new Error("Question not found");

    question.views++;
    await question.save();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(question)),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
