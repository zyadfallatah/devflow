"use server";

import { GetJobsParams } from "@/types/action";
import { ActionResponse, ErrorResponse, Job } from "@/types/global";
import { GetJobsSchema } from "../validation";
import action from "../handlers/action";
import handleError from "../handlers/error";
import { fetchHandler } from "../handlers/fetch";

/*
  Apis: 
  - http://ip-api.com/json  || Get location name and codename
  - https://jsearch.p.rapidapi.com/search?query=developer%20jobs%20in%20{location}&country={codename}  || Get jobs
  - https://restcountries.com/v3.1/alpha/sa || Get Flag 
   --- 	"https://flagcdn.com/w320/{codename}.png"
*/

export const getJobs = async (
  params: GetJobsParams
): Promise<ActionResponse<{ jobs: Job[]; isNext: boolean }>> => {
  const validationResult = await action({
    params,
    schema: GetJobsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { locationCodename, page, pageSize, query } = validationResult.params!;
  let countryInfo = {
    countryCode: "",
    countryName: "",
  };

  if (
    locationCodename === "current" ||
    locationCodename === undefined ||
    locationCodename === ""
  ) {
    const response = await fetch("http://ip-api.com/json");
    const currentLocation = (await response.json()) as {
      countryCode: string;
      country: string;
    };
    countryInfo = {
      countryCode: currentLocation.countryCode,
      countryName: currentLocation.country,
    };
  } else {
    countryInfo = {
      countryCode: locationCodename,
      countryName: locationCodename,
    };
  }

  const { countryCode, countryName } = countryInfo;
  try {
    const getJobs = await fetchHandler<Job[]>(
      `https://jsearch.p.rapidapi.com/search?query=${query || ""}%20developer%20jobs%20in%20${countryName}&country=
      // ${countryCode}&num_pages=${Math.round(Number(pageSize) / 10) || 1}&page=${Number(page) || 1}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
          "x-rapidapi-key": process.env.RAPID_API_JOB_KEY!,
        },
      }
    );
    const isNext = getJobs.data?.length === Number(pageSize);
    console.log(getJobs.data?.length);
    return {
      success: true,
      data: {
        jobs: getJobs.data || [],
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
