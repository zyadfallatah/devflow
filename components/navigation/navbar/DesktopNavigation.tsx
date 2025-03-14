import React from "react";
import NavLinks from "./NavLinks";
import { Button } from "../../ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";

const DesktopNavigation = () => {
  return (
    <nav
      className="hidden sm:flex flex-col background-light900_dark200  shadow-md h-[calc(100vh-80px)] 
    border-none w-[105px] lg:w-[266px] gap-4 pt-16 items-start justify-between px-5 pb-6"
    >
      <section className="flex flex-col w-full gap-3.5">
        <NavLinks />
      </section>
      <div className="flex flex-col w-full gap-2.5">
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
      </div>
    </nav>
  );
};

export default DesktopNavigation;
