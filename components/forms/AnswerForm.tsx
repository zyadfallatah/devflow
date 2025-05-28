"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { AnswerSchema } from "@/lib/validation";
import { useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

interface Props {
  questionId: string;
  questionTitle: string;
  questionContent: string;
}

const AnswerForm = ({ questionId, questionTitle, questionContent }: Props) => {
  const [isAnswering, startAnsweringTransition] = useTransition();
  const [isAISubmitting, setisAISubmitting] = useState(false);
  const session = useSession();

  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    startAnsweringTransition(async () => {
      const result = await createAnswer({
        content: values.content,
        questionId,
      });

      if (result.success) {
        form.reset();
        toast.success("Success", {
          description: "Answer created successfully",
        });
        if (editorRef.current) {
          editorRef.current.setMarkdown("");
        }
        return;
      }
      toast.error("Error", { description: result.error?.message });
    });
  };

  const genterateAIAnswer = async () => {
    if (session.status !== "authenticated") {
      return toast.error("Error", {
        description: "Please sign in to generate AI answer.",
      });
    }
    setisAISubmitting(true);
    const userAnswer = editorRef.current?.getMarkdown();
    try {
      const { success, data, error } = await api.ai.getAnswer(
        questionTitle,
        questionContent,
        userAnswer || ""
      );
      if (!success || !data) {
        return toast.error("Error", {
          description: error?.message,
        });
      }

      const formattedAnswer = data.replace(/<br>/g, " ");

      if (editorRef.current) {
        editorRef.current.setMarkdown(formattedAnswer);
        form.setValue("content", formattedAnswer);
        form.trigger();
      }

      toast.success("Success", {
        description: "AI Answer created successfully",
      });
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong your request",
      });
    } finally {
      setisAISubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <div>
        <div className="flex flex-col gap-5 justify-between sm:flex-row sm:items-center sm:gap-2">
          <h4 className="paragrapgh-semibold text-dark400_light800">
            Write Your Answer Here
          </h4>
          <Button
            className="btn light-border-2 gap-1.5 rounded-md border px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
            disabled={isAISubmitting}
            onClick={genterateAIAnswer}
          >
            {isAISubmitting ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>
                <Image
                  src={"/icons/stars.svg"}
                  width={12}
                  height={12}
                  alt="stars"
                  className="object-contain"
                />
                Generate AI Answer
              </>
            )}
          </Button>
        </div>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="mt-6 flex w-full gap-10 flex-col"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Editor
                    value={field.value}
                    editorRef={editorRef}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-8 flex justify-end">
            <Button
              disabled={isAnswering}
              type="submit"
              className="primary-gradient !text-light-900 w-fit"
            >
              {isAnswering ? (
                <>
                  <ReloadIcon className="mr-2 size-4 animate-spin" />
                  <span>Submitting</span>
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
};

export default AnswerForm;
