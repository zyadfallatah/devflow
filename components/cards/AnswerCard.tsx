import { Answer } from "@/types/global";
import React, { Suspense } from "react";
import UserAvatar from "../UserAvatar";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { cn, getTimeStamp } from "@/lib/utils";
import Preview from "../editor/Preview";
import Votes from "../votes/Votes";
import { hasVoted } from "@/lib/actions/vote.action";
import EditDeleteAction from "../user/EditDeleteAction";

interface Props extends Answer {
  containerClasses?: string;
  showReadMore?: boolean;
  showActionBtns?: boolean;
}

const AnswerCard = ({
  _id,
  content,
  author,
  createdAt,
  upvotes,
  downvotes,
  question,
  containerClasses,
  showReadMore,
  showActionBtns,
}: Props) => {
  const hasVotedPromise = hasVoted({ targetId: _id, targetType: "answer" });
  return (
    <article
      className={cn("relative light-border border-b py-10", containerClasses)}
    >
      <span id={`answer-${_id}`} className="hash-span" />
      {showActionBtns && (
        <div className="background-light800 flex-center absolute -right-2 -top-5 size-9 rounded-full">
          <EditDeleteAction type="answer" itemId={_id} />
        </div>
      )}
      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={author._id}
            name={author.name}
            imageUrl={author.image}
            className="size-5 rounded-full object-cover"
          />
          <Link
            href={ROUTES.PROFILE(author._id)}
            className="flex flex-col sm:flex-row  sm:items-center max-sm:mt-2 ml-1"
          >
            <p className="body-semibold text-dark300_light700">
              {author.name ?? "Anonymous"}
            </p>

            <p className="small-regular text-dark400_light500 ml-0.5 mt-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(createdAt)}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Votes
              upvotes={upvotes}
              downvotes={downvotes}
              targetType="answer"
              targetId={_id}
              hasVotedPromise={hasVotedPromise}
            />
          </Suspense>
        </div>
      </div>
      <Preview content={content} />

      {showReadMore && (
        <Link
          href={ROUTES.QUESTION(question) + `#answer-${_id}`}
          className="body-semibold relative z-10 font-spacegrotes text-primary-500"
        >
          <p className="mt-1">Read more...</p>
        </Link>
      )}
    </article>
  );
};

export default AnswerCard;
