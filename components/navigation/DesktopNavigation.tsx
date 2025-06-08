import React from "react";
import NavLinks from "./navbar/NavLinks";
import { Button } from "../ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const DesktopNavigation = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  return (
    <nav
      className="hidden sticky sm:flex flex-col min-h-screen background-light900_dark200 shadow-md h-[calc(100vh-80px)] 
    border-none w-[105px] lg:w-[266px] gap-4 pt-36 items-start justify-between px-5 pb-6 left-0 top-0"
    >
      <section className="flex flex-col w-full gap-3.5">
        <NavLinks userId={userId} />
      </section>
      <div className="flex flex-col w-full gap-2.5">
        {userId ? (
          <form
            action={async () => {
              "use server";
              await signOut({
                redirect: true,
                redirectTo: "/",
              });
            }}
          >
            <Button
              type="submit"
              className="base-medium w-fit !bg-transparent px-4 py-3"
            >
              <LogOut className="size-5 text-black dark:text-white" />
              <span className="max-lg:hidden text-dark300_light900">
                Logout
              </span>
            </Button>
          </form>
        ) : (
          <>
            <Link href={ROUTES.SIGN_IN}>
              <Button className="small-medium btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 shadow-none">
                <span className="primary-text-gradient">Log In</span>
              </Button>
            </Link>
            <Link href={ROUTES.SIGN_UP}>
              <Button
                className="small-medium light-border-2 btn-tertiary text-dark_light900 
                min-h-[41px] w-full rounded-lg border px-4 py-3 shadow-none"
              >
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default DesktopNavigation;
