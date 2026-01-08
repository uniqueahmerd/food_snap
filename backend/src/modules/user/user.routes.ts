import { Router } from "express";
import { login, logout, refreshAccessToken, register } from "./user.controller.js";
import { loginValidator, registerValidator } from "../../utils/validator.js";



const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", loginValidator, login)
userRouter.post("/logout", registerValidator, logout);

userRouter.post("/refresh", refreshAccessToken);
export default userRouter;