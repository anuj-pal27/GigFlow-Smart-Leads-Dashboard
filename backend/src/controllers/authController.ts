import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../models/User";
import { catchAsync } from "../utils/catchAsync";
import { signToken } from "../utils/jwt";
import { sendSuccess } from "../utils/response";
import { AppError } from "../utils/AppError";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role?: "admin" | "sales";
  };

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role ?? "sales"
  });

  const token = signToken({ userId: String(user._id), role: user.role });

  sendSuccess(
    res,
    "Registration successful",
    {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    },
    201
  );
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email: string;
    password: string;
  };

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signToken({ userId: String(user._id), role: user.role });

  sendSuccess(res, "Login successful", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const user = await User.findById(req.user.userId).select("-password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  sendSuccess(res, "User fetched successfully", { user });
});
