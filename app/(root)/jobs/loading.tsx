"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { setInterval } from "timers";

const loading = () => {
  const [loadingText, setLoading] = useState<string | null>("Jobs");
  const [lateLoading, setLateLoading] = useState<string | null>(null);
  useEffect(() => {
    setInterval(() => {
      setLoading("Countries");
    }, 4000);
    setInterval(() => {
      setLoading("Locations");
    }, 3000);
    setInterval(() => {
      setLoading("Oppertunities");
    }, 5000);

    setTimeout(() => {
      setLateLoading("That's takes longer than expected 😅");
    }, 9000);
  }, []);
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Jobs</h1>
      <div className="flex flex-col justify-center items-center gap-4 min-h-[calc(100vh-80px)]">
        <Image
          src="/icons/currency-dollar-circle.svg"
          alt="loader"
          width={100}
          height={100}
          className="animate-spin"
        />
        <h2 className="animate-pulse text-dark100_light900 h2-bold">
          Loading {loadingText}...
        </h2>
        <h3 className="text-primary-500 h3-bold">
          {lateLoading && lateLoading}
        </h3>
      </div>
    </>
  );
};

export default loading;
