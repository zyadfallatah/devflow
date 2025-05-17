import Link from "next/link";

import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import LocalSearch from "@/components/search/LocalSearch";
import HomeFilter from "@/components/filters/HomeFilters";
import QuestionCard from "@/components/cards/QuestionCard";
import handleError from "@/lib/handlers/error";
import { api } from "@/lib/api";

const questions = [
  {
    _id: "1",
    title: "How to learn React?",
    description: "I want to learn React, can anyone help me?",
    tags: [
      { _id: "1", name: "React" },
      { _id: "2", name: "JavaScript" },
    ],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date(),
  },
  {
    _id: "2",
    title: "How to learn JavaScript?",
    description: "I want to learn JavaScript, can anyone help me?",
    tags: [
      { _id: "1", name: "JavaScript" },
      { _id: "2", name: "JavaScript" },
    ],
    author: {
      _id: "1",
      name: "John Doe",
      image:
        "https://static.vecteezy.com/system/resources/previews/002/002/403/non_2x/man-with-beard-avatar-character-isolated-icon-free-vector.jpg",
    },
    upvotes: 10,
    answers: 5,
    views: 100,
    createdAt: new Date("2021-09-01"),
  },
];

interface Searcharams {
  searchParams: Promise<{ [key: string]: string }>;
}

// const test = async () => {
//   try {
//     return await api.users.getAll();
//   } catch (error) {
//     return handleError(error);
//   }
// };

const Home = async ({ searchParams }: Searcharams) => {
  const { query = "", filter = "" } = await searchParams;
  const filteredQuestions = questions.filter((question) => {
    if (query === "" && filter === "") return true;
    const matchQuery = question.title
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchFilters = question.tags[0].name
      .toLowerCase()
      .includes(filter.toLowerCase());
    return matchQuery && matchFilters;
  });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button
          className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900"
          asChild
        >
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className="mt-11">
        <LocalSearch
          route="/"
          imgSrc="/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
      </section>
      <HomeFilter />
      <div className="mt-10 flex w-full flex-col gap-6">
        {filteredQuestions.map((question) => {
          return <QuestionCard key={question._id} question={question} />;
        })}
      </div>
    </>
  );
};

export default Home;
