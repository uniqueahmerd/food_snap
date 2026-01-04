import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshAccessToken,
  // checkAuth,
} from "../controllers/Auth.controller.js";
import { loginValidator, registerValidator } from "../utils/validator.js";
// import { authenticate, authorize } from "../midddleware/auth.middleware";

const AuthRouter = Router();

AuthRouter.post("/register", registerValidator, register);
AuthRouter.post("/login", loginValidator, login);
AuthRouter.post("/logout", logout);

AuthRouter.post("/refresh", refreshAccessToken);

// AuthRouter.get("/check-auth", checkAuth);

export default AuthRouter;
