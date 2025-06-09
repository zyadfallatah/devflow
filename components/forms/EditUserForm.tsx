"use client";
import { UpdateUserParams } from "@/types/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UpdateUserSchema } from "@/lib/validation";
import { Input } from "../ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useTransition } from "react";
import ROUTES from "@/constants/routes";
import { updateUser } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UploadImage from "./UploadImage";
interface Params {
  id: string;
  bio?: string;
  image?: string;
  location?: string;
  portofolio?: string;
}
const UpdateUserSchemaWithoutUserId = UpdateUserSchema.omit({ userId: true });

const EditUserForm = ({ id, bio, image, location, portofolio }: Params) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<Omit<UpdateUserParams, "userId">>({
    resolver: zodResolver(UpdateUserSchemaWithoutUserId),
    defaultValues: {
      bio: bio || "",
      image: image || "",
      location: location || "",
      portofolio: portofolio || "",
    },
  });
  const handleUpdateUser = async (
    data: z.infer<typeof UpdateUserSchemaWithoutUserId>
  ) => {
    startTransition(async () => {
      const result = await updateUser({ ...data, userId: id });
      if (result.success) {
        toast.success("Success", {
          description: "User updated successfully",
        });

        if (result.data) router.push(ROUTES.PROFILE(id));
      } else {
        toast.error("Error", {
          description: result.error?.message,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col gap-10"
        onSubmit={form.handleSubmit(handleUpdateUser)}
      >
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="h3-bold">Bio</FormLabel>
              <FormControl className="min-h-[200px] flex items-start gap-2">
                <Textarea
                  {...field}
                  className="resize-none"
                  style={{ textAlign: "start" }}
                />
              </FormControl>
              <FormDescription>
                Tell us a little about yourself. This will be visible to other
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Controller
          control={form.control}
          name="image"
          defaultValue=""
          render={({ field }) => (
            <UploadImage {...field} register={form.register} />
          )}
        />
        <FormField
          control={form.control}
          name="portofolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="h3-bold">Portfolio</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="https://portfolio.com"
                  className="py-6"
                />
              </FormControl>
              <FormDescription>
                Add a link to your portfolio. This will be visible to other
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="h3-bold">Location</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Washington, DC"
                  className="py-6"
                />
              </FormControl>
              <FormDescription>
                Add your location. This will be visible to other
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-16 flex justify-end">
          <Button
            disabled={isPending}
            type="submit"
            className="primary-gradient !text-light-900 w-fit"
          >
            {isPending ? (
              <>
                <ReloadIcon className="mr-2 size-4 animate-spin" />
                <span>Submitting</span>
              </>
            ) : (
              <>Edit Profile</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditUserForm;
