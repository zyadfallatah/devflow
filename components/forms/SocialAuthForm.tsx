"use client";
import { signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import Image from "next/image";
import { toast } from "sonner";
import ROUTES from "@/constant/routes";

const SocialAuthForm = () => {
  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
        redirect: false,
      });
    } catch (error: any) {
      toast.error("Sign in failed", {
        description: `${error!.message instanceof Error} An error occured during sign in`,
      });
    }
  };

  const buttonClass =
    "background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 min-h px-4 py-3.5";
  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClass} onClick={() => handleSignIn("github")}>
        <Image
          src="/icons/github.svg"
          alt="github logo"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>Log in with Github</span>
      </Button>
      <Button className={buttonClass} onClick={() => handleSignIn("google")}>
        <Image
          src="/icons/google.svg"
          alt="github logo"
          width={20}
          height={20}
          className="mr-2.5 object-contain"
        />
        <span>Log in with Google</span>
      </Button>
      <Button onClick={() => signOut()}>Signout</Button>
    </div>
  );
};

export default SocialAuthForm;
