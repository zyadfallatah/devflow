"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { ActionResponse } from "@/types/global";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AuthProps<T extends FieldValues> {
  formType: "SIGN_IN" | "SIGN_UP";
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<ActionResponse>;
}

const AuthForm = <T extends FieldValues>({
  formType,
  schema,
  defaultValues,
  onSubmit,
}: AuthProps<T>) => {
  const router = useRouter();
  const buttonText = formType === "SIGN_IN" ? "Sign In" : "Sign Up";

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = (await onSubmit(data)) as ActionResponse;

    if (result.success) {
      toast.success("Success", {
        description:
          formType === "SIGN_IN"
            ? "Signed In successfully"
            : "Signed Up successfully",
      });
      return router.push(ROUTES.HOME);
    }

    toast.error(`Error ${result.status}`, {
      description: result.error?.message,
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="mt-8 space-y-6"
      >
        {Object.keys(defaultValues).map((field) => {
          return (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-2.5">
                  <FormLabel className="paragrapgh-medium text-400_light700">
                    {field.name === "email"
                      ? "Email Address"
                      : field.name.charAt(0).toUpperCase() +
                        field.name.slice(1)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      required
                      type={field.name === "password" ? "password" : "text"}
                      className="paragrapgh-regular background-light900_dark300 light-border2 
                      text-dark300_light700 not-focus min-h-12 rounded-1.5 border"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button
          disabled={form.formState.isSubmitting}
          className="primary-gradient paragrapgh-medium min-h-12 
          w-full rounded-2 px-4 py-3 font-inter text-light-900!"
        >
          {form.formState.isSubmitting
            ? buttonText === "Sign In"
              ? "Signin In..."
              : "Signin Up ..."
            : "Sign Up"}
        </Button>

        {formType === "SIGN_IN" ? (
          <p>
            Don't have an account?{" "}
            <Link
              href={ROUTES.SIGN_UP}
              className="paragrapgh-semibold primary-text-gradient"
            >
              Sign Up
            </Link>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <Link
              href={ROUTES.SIGN_IN}
              className="paragrapgh-semibold primary-text-gradient"
            >
              Sign In
            </Link>
          </p>
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
