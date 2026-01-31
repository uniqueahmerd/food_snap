import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepositry } from "./user.repo.js";
import { validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";

export class UserService {
  private repo = new UserRepositry();

  async register(name: string, email: string, password: string) {
    // Validate inputs
    const errors: any = validationResult(Request);

    if (!errors.isEmpty()) {
      throw new Error(errors.array());
    }
    try {
      //basic validation
      if (!name || !email || !password)
        throw new Error("All fields are required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email))
        throw new Error(
          "Invalid email format please check the email and ty again"
        );

      // checking the user existance
      const user = await this.repo.findByEmail(email);
      if (user?.email)
        throw new Error(
          "Email already exists in the system please check the email and try again"
        );

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      //inserting new user into DB
      const newUser = await this.repo.create(name, email, hashedPassword);

      // Generate tokens
      const accessToken = generateAccessToken(
        newUser.id,
        newUser.role as string
      );
      const refreshToken = generateRefreshToken(
        newUser.id,
        newUser.role as string
      );

      // Store refresh token in DB
      await this.repo.storingRefreshToken(newUser.id, refreshToken);

      return { newUser, accessToken, refreshToken };
    } catch (err: any) {
      console.error("REGISTER ERROR 👉", err);
      throw new Error(err.message);
    }
  }

  async login(email: string, password: string) {
    try { 
      //basic validation
      if (!email || !password) throw new Error("All fields are required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error("Invalid email");

      // checking the user with the given email
      const user = await this.repo.findByEmail(email);
      if (!user?.email)
        throw new Error(
          "Email not found in the system please enter a correct email addres"
        );

      // checking the password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) throw new Error("Invalid password");

      // Generate tokens
      const accessToken = generateAccessToken(user.id, user.role as string);
      const refreshToken = generateRefreshToken(user.id, user.role as string);

      // Store refresh token
      await this.repo.storingRefreshToken(user.id, refreshToken);
      return { user, accessToken, refreshToken };
    } catch (err: any) {
      console.log("❌ Login service error:", err.message);

      throw new Error(err.message);
    }
  }

  async logout(refresh: string) {
    try {
      // If token exists, revoke it in DB
      if (refresh) {
        await this.repo.updatingRevoked(refresh);
      }
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async refreshAccessToken(token: string) {
    if (!token) throw new Error("No refresh token");

    try {
      // 1. Verify refresh token signature
      const refreshToken = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET!
      ) as {
        userId: string;
        role?: string;
      };

      // 2. Check token exists in DB and not revoked
      const result = await this.repo.checkingTokenInDb(token);

      if (!result) throw new Error("Token revoked or expired");

      // It will only be revoked on logout
      const accessToken = generateAccessToken(
        refreshToken.userId,
        refreshToken.role as string
      );

      return { accessToken };
    } catch (err: any) {
      throw new Error("Invalid refresh token: " + err.message);
    }
  }
}
