"use client";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { formUrlQuery, removeKeyFromUrlQuery } from "@/lib/url";

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
  iconPostion?: "left" | "right";
}

const LocalSearch = ({
  imgSrc,
  route,
  placeholder,
  iconPostion = "left",
  otherClasses,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(() => {
      if (searchQuery) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: "query",
          value: searchQuery,
        });

        router.push(newUrl, { scroll: false });
        setLoading(false);
      } else {
        if (pathname === route) {
          const newUrl = removeKeyFromUrlQuery({
            params: searchParams.toString(),
            keysToRemove: ["query"],
          });

          router.push(newUrl, { scroll: false });
          setLoading(false);
        }
      }
    }, 1000);
    return () => {
      clearTimeout(debounce);
    };
  }, [searchQuery]);

  return (
    <div
      className={cn(
        "background-light800_darkgradient flex min-h-[65px] grow items-center rounded-[10px] gap-4 px-4",
        otherClasses
      )}
    >
      {iconPostion === "left" && (
        <Image
          src={imgSrc}
          alt="search "
          className="cursor-pointer"
          width={24}
          height={24}
        />
      )}
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
      {iconPostion === "right" && (
        <Image
          src={imgSrc}
          alt="search "
          className="cursor-pointer"
          width={24}
          height={24}
        />
      )}
      {loading && (
        <Image
          src="/icons/currency-dollar-circle.svg"
          alt="loader"
          width={24}
          height={24}
          className="animate-spin"
        />
      )}
    </div>
  );
};

export default LocalSearch;
