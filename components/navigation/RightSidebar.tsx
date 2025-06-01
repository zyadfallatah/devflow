import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import TagCard from "../cards/TagCard";
import { getTags } from "@/lib/actions/tag.action";
import { getQuestions } from "@/lib/actions/question.action";

const topQuesitons = [
  { _id: "1", title: "How to create custom hook in react" },
  { _id: "2", title: "How to use react query" },
  { _id: "3", title: "How to use redux" },
  { _id: "4", title: "How to use react router" },
  { _id: "5", title: "How to use react context" },
];

const RightSidebar = async () => {
  const { data } = await getTags({
    filter: "popular",
    pageSize: 5,
  });
  const { data: questionsResult } = await getQuestions({
    filter: "popular",
    pageSize: 5,
  });
  const { tags } = data || {};
  const { questions } = questionsResult || {};
  return (
    <section
      className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px]
    flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {!questions && (
            <p className="body-medium text-dark500_light700">No questions</p>
          )}
          {questions &&
            questions.map(({ _id, title }) => {
              return (
                <Link
                  key={_id}
                  href={ROUTES.QUESTION(_id)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 line-clamp-1">
                    {title}
                  </p>
                  <Image
                    src="/icons/chevron-right.svg"
                    alt="chevron"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              );
            })}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>

        <div className="mt-7 flex flex-col gap-4">
          {!tags && (
            <p className="body-medium text-dark500_light700">No tags</p>
          )}
          {tags &&
            tags.map((tag) => {
              return <TagCard key={tag._id} {...tag} compact showCount />;
            })}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
