import JobCard from "@/components/cards/JobCard";
import JobsFilter from "@/components/filters/JobsFilter";
import Pagination from "@/components/Pagination";
import { getJobs, getLocations } from "@/lib/actions/jobs.action";
import { Job, RouteParams } from "@/types/global";
import React from "react";

const Jobs = async ({ searchParams }: RouteParams) => {
  const { locationCodename, query, page, pageSize } = await searchParams;
  const parsedPage = Number(page) || 1;
  const parsedPageSize = Number(pageSize) || 10;
  const { data, success, error } = await getJobs({
    locationCodename: locationCodename || "",
    query: query || "",
    page: parsedPage,
    pageSize: parsedPageSize,
  });
  const { data: countriesList, success: successCountries } =
    await getLocations("sa");

  const { jobs, isNext } = data!;

  if (!success || !jobs) {
    return <div>No Jobs</div>;
  }

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>
      <div className="flex">
        <JobsFilter countriesList={countriesList!} />
      </div>
      <section className="light-border mb-9 mt-11 flex flex-col gap-9 border-b pb-9">
        {jobs?.length > 0 ? (
          jobs
            ?.filter((job: Job) => job.job_title)
            .map((job: Job) => <JobCard key={job.job_id} job={job} />)
        ) : (
          <div className="paragraph-regular text-dark200_light800 w-full text-center">
            Oops! We couldn&apos;t find any jobs at the moment. Please try again
            later
          </div>
        )}
      </section>
      {jobs?.length > 0 && <Pagination page={parsedPage} isNext={isNext} />}
    </>
  );
};

export default Jobs;
