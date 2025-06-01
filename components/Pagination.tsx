"use client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { formUrlQuery } from "@/lib/url";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  page?: number | string;
  isNext: boolean;
  containerClasses?: string;
}

const Pagination = ({ page = 1, isNext, containerClasses }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handleNavigation = (type: "prev" | "next") => {
    const nextPageNumber =
      type === "prev" ? Number(page) - 1 : Number(page) + 1;

    // Update the page number in the URL
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-2 mt-5",
        containerClasses
      )}
    >
      {
        // Previous button
        Number(page) > 1 && (
          <Button
            onClick={() => handleNavigation("prev")}
            className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
          >
            <p className="body-medium text-dark200_light800">Previous</p>
          </Button>
        )
      }
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{page}</p>
      </div>
      {
        // Next button
        isNext && (
          <Button
            onClick={() => handleNavigation("next")}
            className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
          >
            <p className="body-medium text-dark200_light800">Next</p>
          </Button>
        )
      }
    </div>
  );
};

export default Pagination;
