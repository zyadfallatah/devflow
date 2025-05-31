"use client";

import { toggleSaveCollection } from "@/lib/actions/collection.action";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

const SaveQuestion = ({ questionId }: { questionId: string }) => {
  const session = useSession();
  const userId = session?.data?.user?.id;

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId) {
      return toast.error("You must be logged in to save a question");
    }
    setIsLoading(true);

    try {
      const { data, success, error } = await toggleSaveCollection({
        questionId,
      });

      if (!success || !data) {
        throw new Error(error?.message);
      }
      const { saved } = data;

      toast.success(`Question ${saved ? "saved" : "unsaved"} successfully`);
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the question",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasSaved = false;

  return (
    <Image
      src={`${hasSaved ? "/icons/star-filled.svg}" : "/icons/star-red.svg"}`}
      width={18}
      height={18}
      alt="save"
      className={`cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label="Save Question"
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
