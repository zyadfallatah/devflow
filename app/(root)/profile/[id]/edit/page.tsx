import { auth } from "@/auth";
import EditUserForm from "@/components/forms/EditUserForm";
import { getUser } from "@/lib/actions/user.action";
import { RouteParams } from "@/types/global";
import { redirect } from "next/navigation";
import React from "react";

const EditProfile = async ({ params }: RouteParams) => {
  const session = await auth();
  const loggedInUserId = session?.user?.id;
  const { id } = await params;
  if (loggedInUserId !== id) return redirect("/");

  const { data, success } = await getUser({ userId: id });
  const { user: userData } = data || {};
  return (
    <>
      <h1 className="h1-bold text-dark100_light900 mb-9">Edit Profile</h1>
      <EditUserForm
        id={id}
        bio={userData?.bio}
        image={userData?.image}
        location={userData?.location}
        portofolio={userData?.portofolio}
      />
    </>
  );
};

export default EditProfile;
