import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { cn } from "@/lib/utils";

const UserAvatar = ({
  id,
  name,
  imageUrl,
  className,
  fallbackClassName,
}: {
  id: string;
  name: string;
  imageUrl?: string;
  className?: string;
  fallbackClassName?: string;
}) => {
  const intials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <Link href={ROUTES.PROFILE(id)}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          width={36}
          height={36}
          alt="avatar"
          className="object-cover rounded-full"
          quality={100}
        />
      ) : (
        <Avatar>
          <AvatarFallback
            className={cn(
              "primary-gradient font-spce-grotesk font-bold tracking-wide text-white",
              fallbackClassName
            )}
          >
            {intials}
          </AvatarFallback>
        </Avatar>
      )}
    </Link>
  );
};

export default UserAvatar;
