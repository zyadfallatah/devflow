import { getTags } from "@/lib/actions/tag.action";
import React from "react";

interface Searcharams {
  searchParams: Promise<{ [key: string]: string }>;
}

const Tags = async ({ searchParams }: Searcharams) => {
  const { page, pageSize, query, filter, sort } = await searchParams;
  const { data, success, error } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
    sort: sort || "",
  });

  return <div>Tags</div>;
};

export default Tags;
