import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
    userId: string;
    role: "admin" | "user";
}

export interface AuthRequest extends Request {
  user?:  AuthUser;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
     return res.status(401).json({
      success: false,
      message: "Authentication required"
     })
  }

  const token: any = authHeader?.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET! as string
    )  as AuthUser
   
    
    req.user = decoded;

     req.user = {
      userId: decoded.userId,
      role: decoded.role,
     };

     next()

  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}





export const authorize =
  // (...allowedRoles: Array<"admin" | "user">) =>
 (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({success: false, message: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({success: false, message: "Forbidden" });
    }

    next();
  };
