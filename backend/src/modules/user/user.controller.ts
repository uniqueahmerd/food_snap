import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { UserRepositry } from "./user.repo.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

const service = new UserService();

export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  try {
    const { name, email, password } = req.body;
    const { newUser, accessToken, refreshToken } = await service.register(
      name,
      email,
      password,
    );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // JS cannot access the cookie
        secure: process.env.NODE_ENV === "production", // only send over HTTPS
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
      accessToken,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Registration failed please try again",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await service.login(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // JS cannot access the cookie
      secure: process.env.NODE_ENV === "production", // only send over HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // cross-site in prod
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Login failed please try again",
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refresh = req.cookies.refreshToken;

  try {
    await service.logout(refresh);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "logout failed",
      error: error.message,
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No refresh token provided",
    });
  }

  try {
    const service = new UserService();
    const { accessToken } = await service.refreshAccessToken(token);

    // Fetch user data to return with the new token
    const decoded = jwt.decode(token) as any;

    const repo = new UserRepositry();
    const user = await repo.findById(decoded?.userId);

    res.status(200).json({ accessToken, user });
  } catch (error: any) {
    console.error("Stack:", error.stack);
    res.status(401).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};
