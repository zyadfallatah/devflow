"use client";
import { Country } from "@/types/global";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import React from "react";
import LocalSearch from "../search/LocalSearch";
import { usePathname } from "next/navigation";
import Image from "next/image";

const JobsFilter = ({ countriesList }: { countriesList?: Country[] }) => {
  const pathname = usePathname();

  return (
    <div className="relative mt-11 flex w-full justify-between gap-5 max-sm:flex-col sm:items-center">
      <LocalSearch
        route={pathname}
        iconPostion="left"
        imgSrc="/icons/job-search.svg"
        placeholder="Job Title, Company, or Keywords"
        otherClasses="flex-1 max-sm:w-full"
      />
      <Select onValueChange={(value) => console.log(value)} defaultValue="All">
        <SelectTrigger className="body-regular light-border background-light800_dark300 text-dark500_light700 line-clamp-1 flex min-h-[56px] items-center gap-3 border p-4 sm:max-w-[210px]">
          <Image
            src="/icons/carbon-location.svg"
            alt="location"
            width={18}
            height={18}
          />

          <div className="line-clamp-1 flex-1 text-left text_-dark500_light700">
            <SelectValue placeholder="Select Location" />
          </div>
        </SelectTrigger>

        <SelectContent className="body-semibold max-h-[350px] max-w-[250px]">
          <SelectGroup>
            <SelectItem value="All" className="px-4 py-3">
              All
            </SelectItem>
            <SelectItem value="USA" className="px-4 py-3">
              USA
            </SelectItem>
            <SelectItem value="UK" className="px-4 py-3">
              UK
            </SelectItem>
            {/* {countriesList ? (
              countriesList.map((country: Country) => (
                <SelectItem
                  key={country.name.common}
                  value={country.name.common}
                  className="px-4 py-3"
                >
                  {country.name.common}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="No results found">No results found</SelectItem>
            )} */}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobsFilter;
