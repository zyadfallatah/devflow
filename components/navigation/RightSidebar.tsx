import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import { title } from "process";
import React from "react";
import TagCard from "../cards/TagCard";

const topQuesitons = [
  { _id: "1", title: "How to create custom hook in react" },
  { _id: "2", title: "How to use react query" },
  { _id: "3", title: "How to use redux" },
  { _id: "4", title: "How to use react router" },
  { _id: "5", title: "How to use react context" },
];

const popularTags = [
  { _id: "1", name: "react", question: 5 },
  { _id: "2", name: "javascript", question: 3 },
  { _id: "3", name: "nextjs", question: 2 },
  { _id: "4", name: "tailwindcss", question: 1 },
  { _id: "5", name: "typescript", question: 1 },
];

const RightSidebar = () => {
  return (
    <section
      className="pt-36 custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px]
    flex-col gap-6 overflow-y-auto border-l p-6 shadow-light-300 dark:shadow-none max-xl:hidden"
    >
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>

        <div className="mt-7 flex w-full flex-col gap-[30px]">
          {topQuesitons.map(({ _id, title }) => {
            return (
              <Link
                key={_id}
                href={ROUTES.PROFILE(_id)}
                className="flex cursor-pointer items-center justify-between gap-7"
              >
                <p className="body-medium text-dark500_light700">{title}</p>
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
          {popularTags.map(({ _id, name, question }) => {
            return (
              <TagCard
                key={_id}
                _id={_id}
                name={name}
                questions={question}
                showCount
                compact
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
