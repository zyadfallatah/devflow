import SocialAuthForm from "@/components/forms/SocialAuthForm";
import Image from "next/image";
import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex min-h-screen items-center justify-center auth-light dark:auth-dark bg-cover bg-no-repeat bg-center px-4 py-10">
      <section
        className="light-border background-light800_dark200 shadow-light-100 min-w-full rounded-[10px] 
      border px-4 py-10 sm:min-w-[250px] sm:px-8"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-2.5">
            <h1 className="h2-bold text-dark100_light900">Join DevFlow</h1>
            <p className="paragraph-regular text-dark500_light400">
              To get your question answered
            </p>
          </div>
          <Image
            src="/images/site-logo.svg"
            alt="DevFlow Logo"
            width={50}
            height={50}
            className="object-contain"
          />
        </div>
        {children}

        <SocialAuthForm />
      </section>
    </main>
  );
};

export default AuthLayout;
