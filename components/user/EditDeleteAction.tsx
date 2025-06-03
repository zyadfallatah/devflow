"use client";
interface Props {
  type: "question" | "answer";
  itemId: string;
}
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const EditDeleteAction = ({ type, itemId }: Props) => {
  const router = useRouter();
  const handleEdit = async () => {
    router.push(ROUTES.QUESTION(itemId) + "/edit");
  };
  const handleDelete = async () => {
    if (type === "question") {
      // Call delete question API
      toast.success("Question deleted successfully", {
        description: "Question has been deleted from the server",
      });
    } else if (type === "answer") {
      // Call delete answer API
      toast.success("Answer deleted successfully", {
        description: "Answer has been deleted from the server",
      });
    }
  };
  return (
    <div
      className={`flex items-center justify-end gap-3 max-sm:w-full ${type === "answer" && "gap-0 justify-center"}`}
    >
      {type === "question" && (
        <Image
          src="/icons/edit.svg"
          width={20}
          height={20}
          alt="edit"
          className="cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger className="cursor-pointer">
          <Image src="/icons/trash.svg" alt="delete" width={14} height={14} />
        </AlertDialogTrigger>
        <AlertDialogContent className="background-light800_dark300">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              {type === "question" ? "question" : "answer"} and remove our
              server
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="btn">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="!border-primary-100 !bg-primary-500 !text-light-800"
              onClick={handleDelete}
            >
              Contiune
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditDeleteAction;
