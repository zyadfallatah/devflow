import User from "@/database/user.model";
import handleError from "@/lib/handlers/error";
import { NotFoundError } from "@/lib/http-errors";
import dbConnect from "@/lib/mongoose";
import { UserSchema } from "@/lib/validation";
import { APIErrorResponse } from "@/types/global";
import { NextResponse } from "next/server";

//GET api/users/[id]
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("user");

  try {
    await dbConnect();
    const user = await User.findById(id);

    if (!user) throw new NotFoundError("user");
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    handleError(error, "api") as APIErrorResponse;
  }
}
//PUT api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("user");

  try {
    await dbConnect();
    const body = await request.json();
    const validatedData = UserSchema.partial().parse(body);

    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      validatedData,
      {
        new: true,
      }
    );

    if (!updatedUser) throw new NotFoundError("user");
    return NextResponse.json(
      { success: true, data: updatedUser },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
//DELETE api/users/[id]
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) throw new NotFoundError("user");

  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("user");

    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
