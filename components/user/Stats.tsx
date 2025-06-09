import { getUserStats } from "@/lib/actions/user.action";
import { formatNumber } from "@/lib/utils";
import { BadgeCounts } from "@/types/global";
import Image from "next/image";
import React from "react";

interface Props {
  userId: string;
}

interface StatsCardProps {
  imgUrl: string;
  value: number;
  title: string;
}

const StatsCard = ({ imgUrl, value, title }: StatsCardProps) => {
  return (
    <div
      className="light-border background-light900_dark300 rounded-md p-5 flex flex-wrap items-center justify-evenly gap-4 border
        shadow-light-300 dark:shadow-dark-200"
    >
      <Image src={imgUrl} alt={title} width={40} height={50} />
      <div>
        <p className="paragraph-semibold text-dark200_light900">{value}</p>
        <p className="body-medium text-dark300_light700">{title}</p>
      </div>
    </div>
  );
};

const Stats = async ({ userId }: Props) => {
  const userStats = await getUserStats({ userId });
  if (!userStats.success) return <h1>No Data</h1>;
  const { totalQuestions, totalAnswers, badges } = userStats.data || {};

  return (
    <div className="mt-4">
      <h4 className="h3-semibold text-dark200_light900">Stats</h4>

      <div className="mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        <div
          className="light-border background-light900_dark300 rounded-md p-5 flex flex-wrap items-center justify-evenly gap-2 border
        shadow-light-300 dark:shadow-dark-200"
        >
          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatNumber(totalQuestions || 0)}
            </p>
            <p className="body-medium text-dark400_light700">Questions</p>
          </div>
          <div>
            <p className="paragraph-semibold text-dark200_light900">
              {formatNumber(totalAnswers || 0)}
            </p>
            <p className="body-medium text-dark400_light700">Answers</p>
          </div>
        </div>
        <StatsCard
          imgUrl="/icons/gold-medal.svg"
          value={badges?.GOLD || 0}
          title="Gold Badges"
        />
        <StatsCard
          imgUrl="/icons/silver-medal.svg"
          value={badges?.SILVER || 0}
          title="Silver Badges"
        />
        <StatsCard
          imgUrl="/icons/bronze-medal.svg"
          value={badges?.BRONZE || 0}
          title="Bronze Badges"
        />
      </div>
    </div>
  );
};

export default Stats;
