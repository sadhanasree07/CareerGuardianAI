import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { JWT_SECRET } from "@/lib/auth";
import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";

export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const decoded: any = jwt.verify(
      token,
      JWT_SECRET
    );

    const body = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        name: body.name,
        email: body.email,
        college: body.college,
        degree: body.degree,
        branch: body.branch,
        cgpa: body.cgpa,
        skills: body.skills,
        careerGoal: body.careerGoal,
        professionalTitle: body.professionalTitle,
        phone: body.phone,
        location: body.location,
        linkedin: body.linkedin,
        github: body.github,
        portfolio: body.portfolio,
        photoUrl: body.photoUrl,
        references: body.references,
      },
      {
        new: true,
      }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile Updated Successfully",
      user: updatedUser,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Profile Update Failed",
      },
      {
        status: 500,
      }
    );

  }
}
