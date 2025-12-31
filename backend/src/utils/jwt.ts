// import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";


export const generateAccessToken = ( id: string, role: string ) => {
 const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
  return jwt.sign(
    { userId: id, role: role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = ( id: string, role: string) => {
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  // const jti = randomUUID
  const token = jwt.sign(
    { userId: id, role: role},
     REFRESH_SECRET,
    { expiresIn: "7d" }
  )
  return token
};

