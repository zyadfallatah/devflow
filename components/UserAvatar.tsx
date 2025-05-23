import ROUTES from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

const UserAvatar = ({
  id,
  name,
  imageUrl,
}: {
  id: string;
  name: string;
  imageUrl: string;
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
          <AvatarFallback className="primary-gradient font-spce-grotesk font-bold tracking-wide text-white">
            {intials}
          </AvatarFallback>
        </Avatar>
      )}
    </Link>
  );
};

export default UserAvatar;
