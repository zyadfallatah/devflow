import QuestionCard from "@/components/cards/QuestionCard";
import DataRenderer from "@/components/DataRenderer";
import CommonFilter from "@/components/filters/CommonFilter";
import HomeFilter from "@/components/filters/HomeFilters";
import Pagination from "@/components/Pagination";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_QUESTION } from "@/constants/states";
import { getTagQuestions } from "@/lib/actions/tag.action";
import { RouteParams } from "@/types/global";
import { Button } from "@mdxeditor/editor";
import { Link } from "lucide-react";
import React from "react";

const TagDetail = async ({ params, searchParams }: RouteParams) => {
  const { id } = await params;
  const { page, pageSize, query } = await searchParams;

  const { data, success, error } = await getTagQuestions({
    tagId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query,
  });

  const { tag, questions, isNext } = data || {};
  return (
    <div>
      <>
        <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="h1-bold text-dark100_light900">{tag?.name}</h1>
        </section>
        <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
          <LocalSearch
            route={ROUTES.TAG(id)}
            imgSrc="/icons/search.svg"
            placeholder="Search questions..."
            otherClasses="flex-1"
          />
        </section>
        <DataRenderer
          success={success}
          error={error}
          data={questions}
          empty={EMPTY_QUESTION}
          render={(questions) => (
            <div className="mt-10 flex w-full flex-col gap-6">
              {questions.map((question) => (
                <QuestionCard key={question._id} question={question} />
              ))}
            </div>
          )}
        />
      </>
      <Pagination page={page} isNext={isNext || false} />
    </div>
  );
};

export default TagDetail;
