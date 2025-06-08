"use client";

import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { globalSearch, SearchResult } from "@/lib/actions/globalSearch.action";
import Link from "next/link";

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const debounce = setTimeout(() => {
      startTransition(async () => {
        if (searchQuery === "") {
          setSearchResults([]);
          return;
        }
        const res = await globalSearch({ query: searchQuery });
        if (!res.data) return;
        setSearchResults(res.data);
      });
    }, 300);

    if (searchQuery === "") {
      setSearchResults([]);
    }

    return () => {
      clearTimeout(debounce);
    };
  }, [searchQuery]);

  return (
    <div
      className={cn(
        "relative background-light800_darkgradient flex min-h-[65px] grow items-center rounded-[10px] gap-4 px-4 max-w-[800px]"
      )}
    >
      <Image
        src="/icons/search.svg"
        alt="search"
        className="cursor-pointer"
        width={24}
        height={24}
      />
      <Input
        type="text"
        placeholder={"Search for anything"}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />
      {searchQuery.length > 2 && (
        <div className="absolute w-full top-14 left-0 flex flex-col items-start background-light800_dark400 text-dark300_light900 text-xs min-h-[200px]">
          {searchResults.length > 0 ? (
            searchResults.map((result, i) => (
              <Link
                key={i}
                href={result.path}
                className="text-dark300_light900 p-3 py-3  w-full flex gap-2 hover:text-light-900 hover:bg-primary-500 hover:brightness-90 border-b border-b-light-400"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <Image
                  src={"/icons/upvote.svg"}
                  alt="search"
                  width={24}
                  height={24}
                />
                <div>
                  <h4 className="text-md">{result.title}</h4>
                  <p className="paragraph-regular">{result.type}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="absolute h3-bold w-full top-0 left-0 flex justify-center items-center gap-2 background-light800_darkgradient px-3 py-1.5 text-dark300_light900 text-xs min-h-[200px]">
              {isLoading ? (
                <Image
                  src="/icons/currency-dollar-circle.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              ) : (
                <p className="body-semibold text-dark300_light700 !text-3xl">
                  No results found
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
