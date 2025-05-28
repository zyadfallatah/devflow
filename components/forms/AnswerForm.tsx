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
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MDXEditorMethods } from "@mdxeditor/editor";
import { ReloadIcon } from "@radix-ui/react-icons";
import Image from "next/image";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
  loading: () => <div>Loading editor...</div>,
});

const AnswerForm = () => {
  const [isSubmitting, setisSubmitting] = useState(false);
  const [isAISubmitting, setisAISubmitting] = useState(false);

  const editorRef = useRef<MDXEditorMethods>(null);

  const form = useForm<z.infer<typeof AnswerSchema>>({
    resolver: zodResolver(AnswerSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof AnswerSchema>) => {
    console.log(values);
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
                    editorRef={field.ref}
                    fieldChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-8 flex justify-end">
            <Button
              disabled={isSubmitting}
              type="submit"
              className="primary-gradient !text-light-900 w-fit"
            >
              {isSubmitting ? (
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
