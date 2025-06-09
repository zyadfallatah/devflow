"use client";
import { getUserUploadImageAuth } from "@/lib/actions/user.action";
import { upload } from "@imagekit/next";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Control,
  Controller,
  RefCallBack,
  useController,
  UseFormRegister,
} from "react-hook-form";
import Image from "next/image";

const UploadImage = (props: {
  ref: RefCallBack;
  onChange: (...event: any[]) => void;
  value?: string;
  register: UseFormRegister<any>;
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(props.value || null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!fileInputRef.current) return;
    const file = fileInputRef.current.files![0];
    try {
      const { data, error } = await getUserUploadImageAuth();
      if (!data || error) throw new Error(error?.message);
      const { token, signature, expire, publicKey } = data;

      const uploadResult = await upload({
        file,
        fileName: file.name,
        expire,
        token,
        signature,
        publicKey,
      });

      const newImageUrl = uploadResult.url!;
      setImageUrl(newImageUrl);
      props.onChange(newImageUrl); // Update the form value || This is what cause the 4 hour debug session ???

      toast.success(`File uploaded successfully`);
    } catch (error) {
      toast.error(
        `Error uploading file: ${error instanceof Error ? error.message : error}`
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {imageUrl && (
        <div className="relative flex w-30 h-30 gap-4 items-center">
          <img
            src={imageUrl}
            alt="Uploaded"
            className="object-cover rounded-full w-20 h-20"
          />
          <p>Current Image</p>
        </div>
      )}
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-2 w-full background-light900_dark200 p-6 text-center hover:!bg-primary-500 cursor-pointer">
          <Image src="/icons/upvote.svg" width={20} height={20} alt="Upload" />
          {fileName || "Click to upload a new image"}
        </div>
      </div>
      <Button
        className="primary-gradient text-light-900"
        type="button"
        onClick={handleUpload}
        disabled={!fileName || fileName === ""}
      >
        Upload file
      </Button>
    </div>
  );
};

export default UploadImage;
