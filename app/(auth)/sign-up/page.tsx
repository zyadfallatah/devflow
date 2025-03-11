"use client";
import AuthForm from "@/components/forms/AuthForm";
import { SignUpSchema } from "@/lib/validation";

const page = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={(data) => Promise.resolve({ success: true })}
    />
  );
};

export default page;
