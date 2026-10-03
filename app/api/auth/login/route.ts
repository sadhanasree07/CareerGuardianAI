import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "../../../../lib/mongodb";
import User from "../../../../models/User";
import { generateToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const db = await connectDB();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          message: "Database is temporarily unavailable. Please try again later.",
        },
        {
          status: 503,
        }
      );
    }

    const body = await req.json();

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and Password are required.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid password.",
        },
        {
          status: 401,
        }
      );
    }

    const token = generateToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login Successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        college: user.college,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}