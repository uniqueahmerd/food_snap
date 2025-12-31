import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { name, email, password_hash } = req.body;

    //basic validation
    if (!name || !email || !password_hash) {
      return res
        .status(400)
        .json({ message: "Name, email, password and are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(email)) {
       return res
         .status(400)
         .json({ success: false, message: "Invalid email" });
     }

    // checking the user existance
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password_hash, 10);

    //inserting new user into DB
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING name email",
      [name, email, hashedPassword]
    );

    // Generate tokens
    const accessToken = generateAccessToken(
      newUser.rows[0].id,
      newUser.rows[0].role
    );
    const refreshToken = generateRefreshToken(
      newUser.rows[0].id,
      newUser.rows[0].role
    );

    // Store refresh token in DB
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2) ",
      [newUser.rows[0].id, refreshToken]
    );
    // // passing the token in cookie
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: false, // true in production
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      // sameSite: "strict",
      path: "/auth/refresh",
      maxAge: 7* 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser.rows[0],
      accessToken,
    });

    return accessToken;
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  // Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  try {
    const { email, password_hash } = req.body;

    //basic validation
    if (!email || !password_hash) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     if (!emailRegex.test(email)) {
       return res
         .status(400)
         .json({ success: false, message: "Invalid email" });
     }

    // checking the user with the given email
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // checking the password
    const validPassword = await bcrypt.compare(
      password_hash,
      user.rows[0].password_hash
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.rows[0].id, user.rows[0].role);
    const refreshToken = generateRefreshToken(
      user.rows[0].id,
      user.rows[0].role
    );
    // Store refresh token
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '7 days' )",
      [user.rows[0].id,  refreshToken]
    ); 

    // passing the token in cookie
    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: false, // true in production
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      // sameSite: "strict",
      path: "/refresh",
      maxAge: 7* 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Login successful",
      user: user.rows[0],
      accessToken
    });

  } catch (err: any) {
    res.status(500).json({success: false, message: err.message });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    // 1. Verify refresh token
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
      role?: string;
    };

    // 2. Check token exists in DB
    const result = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1 AND revoked = false AND expires_at > NOW()",
      [payload]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Token revoked" });
    }

    //rotate token
    await pool.query(
      `UPDATE refresh_tokens SET revoked = true WHERE token = $1`,
      [payload]
    )

    // // // 3. Get user
    // // const userRes = await pool.query(
    // //   "SELECT id, role FROM users WHERE id = $1",
    // //   [payload.userId]
    // // );

    // const user = userRes.rows[0];

    
     
    // 4. Generate new access token (use helper to keep signing consistent)
    const accessToken = generateAccessToken(
      payload.userId,
      payload.role as string 
    ) ;

    return res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET as string
    ) as {
      userId: string;
      role?: string;
    };

    // Ensure token exists in DB
    const tokenRow = await pool.query(
      "SELECT * FROM refresh_tokens WHERE token = $1",
      [token]
    );
    if (tokenRow.rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Fetch user
    const userRes = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [payload.userId]
    );

    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    // Issue a fresh short-lived access token (keeps client authenticated)
    const accessToken = generateAccessToken(user.id, user.role);
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      path: "/",
      maxAge: 3 * 60 * 1000, // 3 minutes
    });

    return res.json({ user });
  } catch (err: any) {
    console.error("checkAuth error:", err);
    return res
      .status(403)
      .json({ message: "Refresh token invalid or expired" });
  }
};

// export const checkAuth = async (req: Request, res: Response) => {
//   try {
//        const user = await pool.query(
//         `SELECT * FROM users WHERE id = $1,`, [req.user.id] 
//        )
//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }
//   console.log("user is authenticated via check-auth endpoint");
  
//     return res.status(200).json({ success: true, user: {
//         ...user,
//         password: undefined,
//       }, });
//   } catch (error: any) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  try {
    // If token exists, delete it from DB
    if (token) {
      const payload = jwt.decode(token) as any;
       
      if (payload) {
        await pool.query(
          `ÙPDATE refresh_tokens SET revoked = true WHERE token = $1`,
          [payload]
        )
      }
      
    }
    res.clearCookie("refreshToken")
    res.status(200).json({success: true,  message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};