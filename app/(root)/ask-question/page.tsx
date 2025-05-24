import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import React from "react";

const AskQuestion = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="grid place-items-center h-[calc(100vh-84px)] text-center">
        <div>
          <h1 className="h1-bold text-dark100_light900 mb-9 !text-5xl">
            Ask a question
          </h1>
          <p className="text-dark100_light900 mb-9 !text-xl">
            You need to be logged in to ask a question
          </p>
          <Link href={ROUTES.SIGN_UP}>
            <Button className="primary-gradient text-white text-2xl p-6">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 mb-9">Ask a question</h1>
      <QuestionForm />
    </>
  );
};

export default AskQuestion;
