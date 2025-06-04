import mongoose from "mongoose";

import { Interaction, User } from "@/database";

import action from "../handlers/action";
import handleError from "../handlers/error";
import { CreateInteractionSchema } from "../validation";
import {
  CreateInteractionParams,
  UpdateReputationParams,
} from "@/types/action";
import { ActionResponse, ErrorResponse } from "@/types/global";
import { IInteraction } from "@/database/interaction.model";

async function updateReputation({
  params,
}: {
  params: UpdateReputationParams;
}) {
  const { interaction, session, performerId, authorId } = params;
  const { action, actionType } = interaction;

  let performerPoints = 0;
  let authorPoints = 0;

  switch (action) {
    case "upvote":
      performerPoints = 2;
      authorPoints = 10;
      break;
    case "downvote":
      performerPoints = -1;
      authorPoints = -2;
      break;
    case "post":
      authorPoints = actionType === "question" ? 5 : 10;
    case "delete":
      authorPoints = actionType === "question" ? -5 : -10;
    default:
      break;
  }

  if (performerId === authorId) {
    await User.findByIdAndUpdate(
      performerId,
      { $inc: { reputation: authorPoints } },
      { session }
    );
    return;
  }

  await User.bulkWrite(
    [
      {
        updateOne: {
          filter: { _id: performerId },
          update: { $inc: { reputation: performerPoints } },
        },
      },
      {
        updateOne: {
          filter: { _id: authorId },
          update: { $inc: { reputation: authorPoints } },
        },
      },
    ],
    { session }
  );
}

export async function createInteraction(
  params: CreateInteractionParams
): Promise<ActionResponse<IInteraction>> {
  const validationResult = await action({
    params,
    schema: CreateInteractionSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {
    action: actionType,
    actionId,
    actionTarget,
    authorId, // target user who owns the content (question/answer)
  } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [interaction] = await Interaction.create(
      [
        {
          user: userId,
          action: actionType,
          actionId,
          actionType: actionTarget,
        },
      ],
      { session }
    );

    // Todo: Update reputation for both the performer and the content author
    await updateReputation({
      params: {
        interaction,
        session,
        performerId: userId!,
        authorId,
      },
    });

    await session.commitTransaction();

    return { success: true, data: JSON.parse(JSON.stringify(interaction)) };
  } catch (error) {
    await session.abortTransaction();
    return handleError(error) as ErrorResponse;
  } finally {
    await session.endSession();
  }
}
