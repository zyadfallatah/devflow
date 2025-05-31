"use server";

import { CreateVoteParams, UpdateVoteCountParams } from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handlers/action";
import { CreateVoteSchema, UpdateVoteCountSchema } from "../validation";
import handleError from "../handlers/error";
import { UnauthorizedError } from "../http-errors";
import mongoose, { ClientSession } from "mongoose";
import Vote from "@/database/vote.model";
import { Question } from "@/database";

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

  const Model = targetType === "question" ? Question : Vote;
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
      type: targetType,
      voteType,
    }).session(session);

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
      } else {
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
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
    } else {
      await Vote.create(
        [
          {
            author: userId,
            type: targetType,
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
    }

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    session.endSession();
  }
}
