import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";

interface Props {
  imgUrl: string;
  alt: string;
  value: string | number;
  title: string;
  href?: string;
  textStyles: string;
  imgStyles?: string;
  isAuthor?: boolean;
  titleStyles?: string;
}

const Metric = ({
  imgUrl,
  alt,
  value,
  title,
  href,
  textStyles,
  imgStyles,
  isAuthor,
  titleStyles,
}: Props) => {
  let intials;
  if (isNaN(Number(value)))
    intials = (value as string)
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  const metricContent = (
    <>
      {imgUrl ? (
        <Image
          src={imgUrl}
          width={24}
          height={24}
          alt={alt}
          className={`rounded-full object-contain ${imgStyles}`}
        />
      ) : (
        <Avatar className="flex justify-center items-center size-6">
          <AvatarFallback
            className={`primary-gradient font-spce-grotesk font-bold tracking-wide text-white text-[12px]`}
          >
            {intials}
          </AvatarFallback>
        </Avatar>
      )}

      <p className={`${textStyles} flex items-center gap-1`}>
        <span>{value}</span>

        {title && (
          <span className={cn(`small-regular line-clamp-1`, titleStyles)}>
            {title}
          </span>
        )}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="flex-center gap-1">
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center gap-1">{metricContent}</div>
  );
};

export default Metric;
