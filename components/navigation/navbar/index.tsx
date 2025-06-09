import Image from "next/image";
import Link from "next/link";
import React from "react";
import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";
import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import GlobalSearch from "@/components/search/GlobalSearch";
import { getUser } from "@/lib/actions/user.action";

const NavBar = async () => {
  const session = await auth();
  const userId = session?.user?.id!;

  const { data: { user } = {} } = await getUser({ userId });
  return (
    <nav className="flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-6 shadow-light-300 dark:shadow-none sm:px-12">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={23}
          height={23}
          alt="DevFlow Logo"
        />
        <p className="h2-bold font-spacegrotes text-dark-100 dark:text-light-900 max-sm:hidden">
          Dev <span className="text-primary-500">Flow</span>
        </p>
      </Link>

      <GlobalSearch />

      <div className="flex-between gap-5">
        <Theme />
        {user && (
          <UserAvatar id={user._id!} name={user.name!} imageUrl={user.image!} />
        )}

        <MobileNavigation />
      </div>
    </nav>
  );
};

export default NavBar;
