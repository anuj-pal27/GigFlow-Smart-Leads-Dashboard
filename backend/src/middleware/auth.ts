import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return next(new AppError("User no longer exists", 401));
    }

    req.user = {
      userId: String(user._id),
      role: user.role
    };

    next();
  } catch (_error) {
    next(new AppError("Invalid token", 401));
  }
};
