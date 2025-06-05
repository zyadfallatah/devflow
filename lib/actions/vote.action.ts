"use server";

import {
  CreateVoteParams,
  HasVotedParams,
  HasVotedResponse,
  UpdateVoteCountParams,
} from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validation";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import mongoose, { ClientSession } from "mongoose";
import Vote from "@/database/vote.model";
import { Answer, Question } from "@/database";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";
import { after } from "next/server";
import { createInteraction } from "./interaction.action";

export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session: ClientSession
): Promise<ActionResponse> {
  const validationParams = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { targetId, targetType, voteType, change } = validationParams.params;

  const Model = targetType === "question" ? Question : Answer;
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session }
    );
    if (!result) {
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;
    }
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  const validationParams = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }

  const { targetId, targetType, voteType } = validationParams.params;
  const userId = validationParams.session?.user?.id;

  if (!userId) {
    return handleError(new UnauthorizedError("User")) as ErrorResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    const Model = targetType === "question" ? Question : Answer;
    const contentDoc = await Model.findById(targetId).session(session);
    if (!contentDoc) {
      throw new Error("Content not found");
    }
    const contentAuthorId = contentDoc.author.toString();

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType,
            change: -1,
          },
          session
        );
        after(async () => {
          await createInteraction({
            action: "downvote",
            actionId: targetId,
            actionTarget: targetType,
            authorId: contentAuthorId!,
          });
        });
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );
        await updateVoteCount(
          {
            targetId,
            targetType: targetType,
            voteType: existingVote.voteType,
            change: -1,
          },
          session
        );
        await updateVoteCount(
          {
            targetId,
            targetType,
            voteType,
            change: 1,
          },
          session
        );
      }
      after(async () => {
        await createInteraction({
          action: existingVote.voteType,
          actionId: targetId,
          actionTarget: targetType,
          authorId: contentAuthorId!,
        });
      });
    } else {
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
      await updateVoteCount(
        {
          targetId,
          targetType,
          voteType,
          change: 1,
        },
        session
      );
      after(async () => {
        await createInteraction({
          action: "upvote",
          actionId: targetId,
          actionTarget: targetType,
          authorId: contentAuthorId!,
        });
      });
    }

    await session.commitTransaction();
    revalidatePath(ROUTES.QUESTION(targetId));
    return { success: true };
  } catch (error) {
    session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationParams = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });
  if (validationParams instanceof Error) {
    return handleError(validationParams) as ErrorResponse;
  }
  const { targetId, targetType } = validationParams.params;
  const userId = validationParams.session?.user?.id;

  if (!userId) {
    return handleError(new UnauthorizedError("User")) as ErrorResponse;
  }

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
    });
    if (!vote) {
      return {
        success: false,
        data: { hasUpvoted: false, hasDownvoted: false },
      };
    }
    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
