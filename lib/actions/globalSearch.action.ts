/*
  Idea: 
   - Input: search term: string
   - Output: list of search results (up to 8): {
    title: string,
    path: string,
    type: string
  }[]

  - The search would look for: questions - answers - users - tags (in this order)
  - return 4 of each
  - if all of them return something return 2 of each
  - if something is missing start filling by others in the same order

  functions: 
   - Get questions: based on upvotes and views
   - Get answers: based on upvotes and view & need to access the question id
   - Get users: based on reputation
   - Get tags: based on questions(number)

   on global.d.ts: GlobalSearchParams: {
    title: string,
    path: string,
    type: string
   }
  
   on validation.ts: GlobalSearchSchmea: {
    params: string
   }
*/

"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import { GlobalSearchSchema } from "../validation";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { Question, Answer, User, Tag } from "@/database";
import ROUTES from "@/constants/routes";
import { Types } from "mongoose";

export interface SearchResult {
  title: string;
  path: string;
  type: string;
}

interface QuestionResult {
  _id: Types.ObjectId;
  title: string;
}

interface AnswerResult {
  _id: Types.ObjectId;
  question?: {
    _id: Types.ObjectId;
    title: string;
  };
}

interface UserResult {
  _id: Types.ObjectId;
  name?: string;
  username: string;
}

interface TagResult {
  _id: Types.ObjectId;
  name: string;
}

export async function globalSearch(params: {
  query: string;
}): Promise<ActionResponse<SearchResult[]>> {
  const validationResult = await action({
    params,
    schema: GlobalSearchSchema,
    authorize: false,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { query } = validationResult.params!;

  try {
    // Execute all database queries concurrently
    const [questions, answers, users, tags] = await Promise.all([
      // Search questions
      Question.find({
        $or: [{ title: { $regex: query, $options: "i" } }],
      })
        .sort({ upvotes: -1, views: -1 })
        .limit(4)
        .select("_id title")
        .lean() as unknown as Promise<QuestionResult[]>,

      // Search answers
      Answer.find({
        content: { $regex: query, $options: "i" },
      })
        .sort({ upvotes: -1 })
        .limit(4)
        .populate("question", "_id title")
        .lean() as unknown as Promise<AnswerResult[]>,

      // Search users
      User.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { username: { $regex: query, $options: "i" } },
        ],
      })
        .sort({ reputation: -1 })
        .limit(4)
        .select("_id name username")
        .lean() as unknown as Promise<UserResult[]>,

      // Search tags
      Tag.find({
        name: { $regex: query, $options: "i" },
      })
        .sort({ questions: -1 })
        .limit(4)
        .select("_id name")
        .lean() as unknown as Promise<TagResult[]>,
    ]);

    // Transform results into the required format
    const results: SearchResult[] = [];

    // Add questions
    questions.forEach((q) => {
      results.push({
        title: q.title,
        path: ROUTES.QUESTION(q._id.toString()),
        type: "question",
      });
    });

    // Add answers
    answers.forEach((a) => {
      if (a.question) {
        results.push({
          title: `Answer to: ${a.question.title} `,
          path: ROUTES.QUESTION(a.question._id.toString()) + `#answer-${a._id}`,
          type: "answer",
        });
      }
    });

    // Add users
    users.forEach((u) => {
      results.push({
        title: u.name || u.username,
        path: ROUTES.PROFILE(u._id.toString()),
        type: "user",
      });
    });

    // Add tags
    tags.forEach((t) => {
      results.push({
        title: t.name,
        path: ROUTES.TAG(t._id.toString()),
        type: "tag",
      });
    });

    // If we have results from all categories, limit to 2 of each
    if (
      questions.length > 0 &&
      answers.length > 0 &&
      users.length > 0 &&
      tags.length > 0
    ) {
      const limitedResults: SearchResult[] = [];
      const categories = ["question", "answer", "user", "tag"];

      categories.forEach((type) => {
        const typeResults = results.filter((r) => r.type === type).slice(0, 2);
        limitedResults.push(...typeResults);
      });

      return {
        success: true,
        data: limitedResults,
      };
    }

    // If we don't have results from all categories, return up to 8 results
    return {
      success: true,
      data: results.slice(0, 8),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
