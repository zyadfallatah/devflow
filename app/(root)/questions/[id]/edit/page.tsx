import { auth } from "@/auth";
import QuestionForm from "@/components/forms/QuestionForm";
import ROUTES from "@/constants/routes";
import { getQuestion } from "@/lib/actions/question.action";
import { RouteParams } from "@/types/global";
import { notFound, redirect } from "next/navigation";
import React from "react";

const EditQuestion = async ({ params }: RouteParams) => {
  const { id } = await params;
  if (!id) return notFound();
  const session = await auth();

  if (!session?.user) return redirect(ROUTES.SIGN_IN);

  const { data: question, success } = await getQuestion({ questionId: id });

  if (!success) return notFound();
  if (question?.author !== session.user.id)
    return redirect(ROUTES.QUESTION(question?._id!));

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 mb-9">Edit Question</h1>
      <QuestionForm question={question} isEdit />
    </>
  );
};

export default EditQuestion;
